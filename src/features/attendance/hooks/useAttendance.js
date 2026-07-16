import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/react-query/queryKeys';
import {
    useBatchAttendanceQuery,
    useOptimizedMarkAttendanceMutation
} from '../../batch/hooks/useAttendanceQueries';
import {
    useBatchStudentsQuery,
    useBatchDetailQuery,
    useBatchesQuery
} from '../../batch/hooks/useBatchQueries';
import {
    useTeachersQuery,
    useTeacherAttendanceListQuery,
    useMarkTeacherAttendanceBulkMutation,
    useTeacherAttendanceQuery,
    useUpdateTeacherAttendanceMutation
} from '../../teacher/hooks/useTeacherQueries';
import {
    transformServerToClientRoster,
    filterClientRoster,
    calculateAttendanceMetrics,
    compileStrategyPayload,
    validateTimeFormat,
    buildStudentBaselineRegistry,
    buildTeacherBaselineRegistry,
    ATTENDANCE_DOMAINS
} from '../utils/attendanceUtils';

/**
 * useBaseAttendanceController
 * The abstract core state orchestrator. Manages local draft deltas, filters,
 * metrics compilation, and transactional dispatch lifecycles.
 * Consumes pre-fetched states programmatically to maintain complete hook compliance.
 */
export function useBaseAttendanceController({
    serverRegistry = [],
    mutation,
    domainConfig,
    filterState,
    options = {}
}) {
    const queryClient = useQueryClient();
    const { selectedDate } = filterState;

    // Local ephemeral changes ledger maintaining input changes at an O(1) tracking complexity.
    const [draftDeltas, setDraftDeltas] = useState({});
    const [saveStatus, setSaveStatus] = useState(null); // 'saving' | 'success' | 'error' | null

    // 1. Normalized Computing Grid Pipeline (Derived State Transformations)
    const rawClientRoster = useMemo(() => {
        try {
            return transformServerToClientRoster(serverRegistry, draftDeltas, domainConfig);
        } catch (err) {
            console.error('[BaseAttendanceController] Roster standardization failed:', err);
            return [];
        }
    }, [serverRegistry, draftDeltas, domainConfig]);

    const finalRoster = useMemo(() => {
        try {
            return filterClientRoster(rawClientRoster, filterState);
        } catch (err) {
            console.error('[BaseAttendanceController] Roster filtering failed:', err);
            return rawClientRoster;
        }
    }, [rawClientRoster, filterState]);

    const metrics = useMemo(() => {
        return calculateAttendanceMetrics(finalRoster, domainConfig.domainKey);
    }, [finalRoster, domainConfig.domainKey]);

    const isDirty = useMemo(() => Object.keys(draftDeltas).length > 0, [draftDeltas]);

    // 2. High-Performance Input Staging Callbacks
    const stageUpdate = useCallback((id, updatedFields) => {
        if (!id) return;
        console.log('[BaseAttendanceController] stageUpdate called for id:', id, 'fields:', updatedFields);

        setDraftDeltas((prev) => {
            const currentEntityDraft = prev[id] || {};
            const mergedFields = { ...currentEntityDraft, ...updatedFields };

            // Evict staging records if they match original baseline values
            const serverMatch = serverRegistry.find(
                (row) => domainConfig.resolveId(row) === id
            );
            console.log('[BaseAttendanceController] serverMatch found:', serverMatch);

            if (serverMatch) {
                const isStatusReverted =
                    mergedFields.status === undefined || mergedFields.status === serverMatch.status;
                const isRemarksReverted =
                    mergedFields.remarks === undefined ||
                    mergedFields.remarks === (serverMatch.remarks || '');
                const isEntryTimeReverted =
                    mergedFields.entry_time === undefined ||
                    mergedFields.entry_time === (serverMatch.entry_time || null);
                const isExitTimeReverted =
                    mergedFields.exit_time === undefined ||
                    mergedFields.exit_time === (serverMatch.exit_time || null);

                console.log('[BaseAttendanceController] revert check:', {
                    isStatusReverted,
                    isRemarksReverted,
                    isEntryTimeReverted,
                    isExitTimeReverted
                });

                if (isStatusReverted && isRemarksReverted && isEntryTimeReverted && isExitTimeReverted) {
                    const cleanedDeltas = { ...prev };
                    delete cleanedDeltas[id];
                    console.log('[BaseAttendanceController] changes reverted, delta deleted for:', id);
                    return cleanedDeltas;
                }
            }

            const nextDeltas = { ...prev, [id]: mergedFields };
            console.log('[BaseAttendanceController] nextDeltas updated:', nextDeltas);
            return nextDeltas;
        });
    }, [serverRegistry, domainConfig]);

    const clearWorkspaceDrafts = useCallback(() => {
        setDraftDeltas({});
    }, []);

    // 3. Central Transaction Executor
    const executeMutationCommit = useCallback(async (payload, onSuccessCallback) => {
        try {
            setSaveStatus('saving');
            await mutation.mutateAsync(payload, {
                onSuccess: (data) => {
                    const targetCacheKeys = domainConfig.resolveCacheKeys
                        ? domainConfig.resolveCacheKeys(filterState)
                        : [domainConfig.cachePrefix];

                    queryClient.invalidateQueries({ queryKey: targetCacheKeys });
                    setSaveStatus('success');
                    setTimeout(() => setSaveStatus(null), 3000);

                    if (onSuccessCallback) {
                        onSuccessCallback();
                    }

                    if (typeof options.onSuccess === 'function') {
                        options.onSuccess(data);
                    }
                },
                onError: (err) => {
                    console.error('[AttendanceController] Save operation failed:', err);
                    setSaveStatus('error');
                    setTimeout(() => setSaveStatus(null), 5000);
                    if (typeof options.onError === 'function') {
                        options.onError(err);
                    }
                }
            });
        } catch (err) {
            console.error('[AttendanceController] Transaction aborted:', err);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 5000);
            if (typeof options.onError === 'function') {
                options.onError(err);
            }
        }
    }, [mutation, domainConfig, filterState, queryClient, options]);

    // 4. Three-Tier Commits Implementation
    const commitIndividualRow = useCallback(async (row) => {
        if (!row) return;
        const payload = compileStrategyPayload({
            commitMode: 'individual',
            draftDeltas,
            roster: finalRoster,
            domainConfig,
            filterState,
            individualRow: row
        });

        await executeMutationCommit(payload, () => {
            setDraftDeltas((prev) => {
                const copy = { ...prev };
                delete copy[domainConfig.resolveId(row)];
                return copy;
            });
        });
    }, [draftDeltas, finalRoster, domainConfig, filterState, executeMutationCommit]);

    const commitDeltaChanges = useCallback(async () => {
        if (Object.keys(draftDeltas).length === 0) return;

        // Perform time formats validation before dispatch
        if (domainConfig.hasTimeCapture) {
            const invalidTimesExist = Object.keys(draftDeltas).some((id) => {
                const delta = draftDeltas[id];
                return (
                    (delta.entry_time && !validateTimeFormat(delta.entry_time)) ||
                    (delta.exit_time && !validateTimeFormat(delta.exit_time))
                );
            });
            if (invalidTimesExist) {
                console.error('[AttendanceController] Format error staged.');
                setSaveStatus('error');
                setTimeout(() => setSaveStatus(null), 5000);
                if (typeof options.onError === 'function') {
                    options.onError(new Error('Invalid punch time format. Must match HH:MM.'));
                }
                return;
            }
        }

        const payload = compileStrategyPayload({
            commitMode: 'delta',
            draftDeltas,
            roster: finalRoster,
            domainConfig,
            filterState
        });

        await executeMutationCommit(payload, () => {
            clearWorkspaceDrafts();
        });
    }, [draftDeltas, finalRoster, domainConfig, filterState, clearWorkspaceDrafts, executeMutationCommit, options]);

    const commitFullRosterSnapshot = useCallback(async () => {
        const payload = compileStrategyPayload({
            commitMode: 'all',
            draftDeltas,
            roster: finalRoster,
            domainConfig,
            filterState
        });

        await executeMutationCommit(payload, () => {
            clearWorkspaceDrafts();
        });
    }, [draftDeltas, finalRoster, domainConfig, filterState, clearWorkspaceDrafts, executeMutationCommit]);

    return {
        roster: finalRoster,
        metrics,
        isDirty,
        draftDeltas,
        saveStatus,
        stageUpdate,
        clearWorkspaceDrafts,
        commitDeltaChanges,
        commitIndividualRow,
        commitFullRosterSnapshot,
        serverRegistry
    };
}

/**
 * useStudentAttendance
 * Student Strategy: Unconditionally invokes Batch Student queries, merges them to build the baseline list, and passes
 * them down to the abstract controller hook.
 */
export function useStudentAttendance(filterState, options = {}) {
    const { selectedBatchId, selectedDate } = filterState;
    const domainConfig = ATTENDANCE_DOMAINS.BATCH_STUDENTS;

    // Load necessary queries to construct the baseline roster
    const { data: batchStudents = [], isLoading: isLoadingStudents } = useBatchStudentsQuery(selectedBatchId);
    const { data: batchDetail, isLoading: isLoadingDetail } = useBatchDetailQuery(selectedBatchId);
    const { data: recordedEntries = [], isLoading: isLoadingEntries, isFetching, error } = useBatchAttendanceQuery(
        selectedBatchId,
        selectedDate
    );

    // Unconditional Mutation Hook call
    const mutation = useOptimizedMarkAttendanceMutation();

    const batchStartTime = batchDetail?.schedule?.start_time || '08:00';
    const batchEndTime = batchDetail?.schedule?.end_time || '13:00';

    const serverRegistry = useMemo(() => {
        if (!selectedBatchId || !selectedDate) return [];
        return buildStudentBaselineRegistry(
            batchStudents,
            recordedEntries,
            selectedDate,
            batchStartTime,
            batchEndTime
        );
    }, [batchStudents, recordedEntries, selectedDate, batchStartTime, batchEndTime, selectedBatchId]);

    const controller = useBaseAttendanceController({
        serverRegistry,
        mutation,
        domainConfig,
        filterState,
        options
    });

    const isLoading = isLoadingStudents || isLoadingDetail || isLoadingEntries || mutation.isPending;

    return {
        ...controller,
        isLoading,
        isFetching,
        error: error || mutation.error
    };
}

/**
 * useTeacherAttendanceStrategy
 * Teacher Strategy: Unconditionally invokes Daily Teacher queries, merges them to build the baseline list, and passes
 * them down to the abstract controller hook.
 */
export function useTeacherAttendanceStrategy(filterState, options = {}) {
    const { selectedDate } = filterState;
    const domainConfig = ATTENDANCE_DOMAINS.TEACHERS;

    // Load necessary queries to construct the baseline roster
    const { data: teachers = [], isLoading: isLoadingTeachers } = useTeachersQuery();
    const { data: batches = [], isLoading: isLoadingBatches } = useBatchesQuery();
    const { data: dailyLogs = [], isLoading: isLoadingLogs, isFetching, error } = useTeacherAttendanceListQuery(
        selectedDate
    );

    // Unconditional Mutation Hook call
    const mutation = useMarkTeacherAttendanceBulkMutation();

    const serverRegistry = useMemo(() => {
        if (!selectedDate) return [];
        return buildTeacherBaselineRegistry(teachers, dailyLogs, batches, selectedDate);
    }, [teachers, dailyLogs, batches, selectedDate]);

    const controller = useBaseAttendanceController({
        serverRegistry,
        mutation,
        domainConfig,
        filterState,
        options
    });

    const isLoading = isLoadingTeachers || isLoadingBatches || isLoadingLogs || mutation.isPending;

    return {
        ...controller,
        isLoading,
        isFetching,
        error: error || mutation.error
    };
}

/**
 * useSingleTeacherAttendance
 * Unified hook managing the profile calendar history for a single teacher.
 */
export function useSingleTeacherAttendance(teacherId, filterState, options = {}) {
    const domainConfig = ATTENDANCE_DOMAINS.SINGLE_TEACHER;

    // Fetch the teacher's historical logs
    const { data: serverRegistry = [], isLoading, isFetching, error } = useTeacherAttendanceQuery(teacherId);

    // Mutation for updating a single day's punches
    const mutation = useUpdateTeacherAttendanceMutation();

    const controller = useBaseAttendanceController({
        serverRegistry,
        mutation,
        domainConfig,
        filterState: { ...filterState, teacherId },
        options
    });

    return {
        ...controller,
        serverRegistry,
        isLoading: isLoading || mutation.isPending,
        isFetching,
        error: error || mutation.error
    };
}