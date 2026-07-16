/**
 * DazzlingDB ERP - Standardized Attendance Domain pure functions
 * Stateless utility module containing mappers, aggregators, mappers, and predicates.
 * Absolutely side-effect-free: no hook contexts or active memory dependencies.
 */

import { parseTimeToStructured, formatStructuredToTime, isPastLocalDate, toLocalDate, formatToKey } from '../../../lib/dateUtils.js';
import { queryKeys } from '../../../lib/react-query/queryKeys.js';

/**
 * Standardized contracts detailing domain boundaries for Attendance tracking.
 * Tells the headless engine how to fetch, serialize, validate, and identify entities.
 */
export const ATTENDANCE_DOMAINS = {
    BATCH_STUDENTS: {
        domainKey: 'BATCH_STUDENTS',
        entityType: 'student',
        queryAction: 'STUDENT_GET_BATCH_ATTENDANCE',
        mutationAction: 'STUDENT_SAVE_BATCH_ATTENDANCE',
        cachePrefix: 'batch-students',
        resolveId: (row) => row?.student_id || row?.id || '',
        resolveName: (row) => row?.student_name || row?.displayName || 'Unknown Student',
        supportedFilters: ['date', 'batch', 'search', 'status'],
        hasTimeCapture: true,
        defaultEntryTime: '08:00',
        defaultExitTime: '13:00',
        resolveCacheKeys: (filterState) => {
            const { selectedBatchId, selectedDate } = filterState;
            return [
                queryKeys.attendance.batch(selectedBatchId, 'all'),
                queryKeys.attendance.batch(selectedBatchId, selectedDate)
            ];
        },
        transformPayload: (rawUpdates, filterState, roster) => {
            const { selectedBatchId, selectedDate, commitMode = 'delta' } = filterState;
            const records = rawUpdates.map(update => {
                const consolidatedRow = roster.find(r => r.id === update.id) || {};
                const isAbsent = consolidatedRow.status === 'A' || consolidatedRow.status === 'NR';
                return {
                    student_id: update.id,
                    status: consolidatedRow.status === 'NR' ? null : consolidatedRow.status,
                    entry_time: isAbsent ? null : parseTimeToStructured(consolidatedRow.entry_time),
                    exit_time: isAbsent ? null : parseTimeToStructured(consolidatedRow.exit_time),
                    remarks: consolidatedRow.remarks || null
                };
            });
            return {
                batch_id: selectedBatchId,
                attendance_date: selectedDate,
                commit_mode: commitMode,
                records
            };
        }
    },
    TEACHERS: {
        domainKey: 'TEACHERS',
        entityType: 'teacher',
        queryAction: 'STAFF_GET_DAILY_ATTENDANCE',
        mutationAction: 'STAFF_SAVE_DAILY_ATTENDANCE',
        cachePrefix: 'teachers-daily',
        resolveId: (row) => {
            if (row?.id && String(row.id).includes('_')) {
                return row.id;
            }
            return row?.teacher_id || row?.id || '';
        },
        resolveName: (row) => row?.full_name || row?.teacher_name || row?.displayName || 'Unknown Faculty',
        supportedFilters: ['date', 'search', 'status'],
        hasTimeCapture: true,
        defaultEntryTime: '08:00',
        defaultExitTime: '16:00',
        resolveCacheKeys: (filterState) => {
            const { selectedDate } = filterState;
            return [
                queryKeys.teacher.attendanceDaily(selectedDate, 'all')
            ];
        },
        transformPayload: (rawUpdates, filterState, roster) => {
            const { selectedDate, commitMode = 'delta' } = filterState;
            const records = rawUpdates.map(update => {
                const consolidatedRow = roster.find(r => r.id === update.id) || {};
                const isAbsent = consolidatedRow.status === 'A' || consolidatedRow.status === 'NR';
                return {
                    teacher_id: consolidatedRow.teacher_id,
                    batch_id: consolidatedRow.batch_id,
                    status: consolidatedRow.status === 'NR' ? null : consolidatedRow.status,
                    entry_time: isAbsent ? null : parseTimeToStructured(consolidatedRow.entry_time),
                    exit_time: isAbsent ? null : parseTimeToStructured(consolidatedRow.exit_time),
                    remarks: consolidatedRow.remarks || null
                };
            });
            return {
                attendance_date: selectedDate,
                commit_mode: commitMode,
                records
            };
        }
    },
    SINGLE_TEACHER: {
        domainKey: 'SINGLE_TEACHER',
        entityType: 'teacher_log',
        cachePrefix: 'teacher-profile-attendance',
        resolveId: (row) => row?.attendance_date || row?.date || '',
        resolveName: (row) => row?.attendance_date || '',
        supportedFilters: ['month', 'year'],
        hasTimeCapture: true,
        defaultEntryTime: '08:00',
        defaultExitTime: '16:00',
        resolveCacheKeys: (filterState) => {
            const { teacherId } = filterState;
            return [
                queryKeys.teacher.attendanceProfile(teacherId, 'all')
            ];
        },
        transformPayload: (rawUpdates, filterState) => {
            const { teacherId } = filterState;
            const update = rawUpdates[0];
            if (!update) return null;
            const isAbsent = update.status === 'A' || update.status === 'NR';
            return {
                teacherId,
                date: update.id,
                data: {
                    batch_id: update.batch_id || null,
                    status: update.status === 'NR' ? null : update.status,
                    entry_time: isAbsent ? null : parseTimeToStructured(update.entry_time),
                    exit_time: isAbsent ? null : parseTimeToStructured(update.exit_time),
                    remarks: update.remarks || null
                }
            };
        }
    }
};

/**
 * Sweeps the active roster list in a single fast loop to compile aggregate counts.
 * @param {Array<Object>} roster - Normalized array of client-side roster entities.
 * @param {string} domainKey - Target identifier domain key matching ATTENDANCE_DOMAINS keys.
 * @returns {Object} Metric KPIs containing total, present, absent, leave, unrecorded, and rates.
 */
export function calculateAttendanceMetrics(roster, domainKey) {
    let total = 0;
    let present = 0;
    let absent = 0;
    let leave = 0;
    let late = 0;
    let unrecorded = 0;
    let attendanceRate = 0;

    try {
        if (!Array.isArray(roster)) {
            return { total, totalCount: total, present, presentCount: present, absent, absentCount: absent, leave, leaveCount: leave, late, unrecorded, rate: '0.0', attendanceRate };
        }

        total = roster.length;
        if (total === 0) {
            return { total, totalCount: total, present, presentCount: present, absent, absentCount: absent, leave, leaveCount: leave, late, unrecorded, rate: '0.0', attendanceRate };
        }

        for (let i = 0; i < total; i++) {
            const item = roster[i];
            const status = item?.status;

            if (status === 'P') {
                present++;
            } else if (status === 'A') {
                absent++;
            } else if (status === 'L') {
                if (domainKey === 'TEACHERS') {
                    late++;
                } else {
                    leave++;
                }
            } else {
                unrecorded++;
            }
        }

        if (domainKey === 'TEACHERS') {
            const recordedCount = total - unrecorded;
            if (recordedCount > 0) {
                attendanceRate = Math.round(((present + late) / recordedCount) * 100);
            }
        } else {
            if (total > 0) {
                attendanceRate = Math.round(((present + leave) / total) * 100);
            }
        }
    } catch (error) {
        console.error('[AttendanceUtils] Failed to calculate metrics:', error);
    }

    return {
        total,
        present,
        absent,
        leave,
        late,
        unrecorded,
        rate: attendanceRate.toFixed(1),
        attendanceRate
    };
}

/**
 * Standardizes multiple backend data structures into a unified client record schema.
 * Dynamically overlays active draft deltas if mutations exist inside local workspace buffers.
 * @param {Array<Object>} serverRegistry - Raw database rows returned by the api query.
 * @param {Object} draftDeltas - Current client-side memory delta changes dictionary.
 * @param {Object} domainConfig - Domain configuration contract to resolve mappings.
 * @returns {Array<Object>} Deep-cloned, normalized roster entries.
 */
export function transformServerToClientRoster(serverRegistry, draftDeltas, domainConfig) {
    try {
        if (!Array.isArray(serverRegistry)) {
            return [];
        }

        if (!domainConfig || typeof domainConfig.resolveId !== 'function') {
            throw new Error('Invalid domainConfig mapping signature provided for normalization.');
        }

        const resolveId = domainConfig.resolveId;
        const resolveName = domainConfig.resolveName;
        const hasTimeCapture = !!domainConfig.hasTimeCapture;

        return serverRegistry.map((row) => {
            if (!row) return null;

            const entityId = resolveId(row);
            const delta = draftDeltas[entityId];

            let rawStatus = delta?.status !== undefined ? delta.status : row.status;
            if (rawStatus === null || rawStatus === undefined || rawStatus === '') {
                rawStatus = 'NR';
            }

            const isAbsentOrNR = rawStatus === 'A' || rawStatus === 'NR';

            // Standardize time mapping structures
            let defaultEntryTime = hasTimeCapture ? (row.entry_time || null) : null;
            let defaultExitTime = hasTimeCapture ? (row.exit_time || null) : null;

            if (defaultEntryTime && typeof defaultEntryTime === 'object') {
                defaultEntryTime = formatStructuredToTime(defaultEntryTime);
            }
            if (defaultExitTime && typeof defaultExitTime === 'object') {
                defaultExitTime = formatStructuredToTime(defaultExitTime);
            }

            return {
                ...row, // Shallow copy server metadata attributes to preserve custom fields
                id: entityId,
                displayName: resolveName(row),
                status: rawStatus,
                remarks: delta?.remarks !== undefined ? delta.remarks : (row.remarks || ''),
                entry_time: isAbsentOrNR ? null : (hasTimeCapture && delta?.entry_time !== undefined ? delta.entry_time : defaultEntryTime),
                exit_time: isAbsentOrNR ? null : (hasTimeCapture && delta?.exit_time !== undefined ? delta.exit_time : defaultExitTime),
                isEdited: !!delta,
                isRowDirty: !!delta
            };
        }).filter(Boolean);
    } catch (error) {
        console.error('[AttendanceUtils] Error mapping database registry rows:', error);
        return [];
    }
}

/**
 * Filters the compiled client-side roster against active parameters.
 * Implements case-insensitive checks and exact state token filters.
 * @param {Array<Object>} clientRoster - Pre-normalized client roster array.
 * @param {Object} filterState - Active filters containing searchQuery, statusFilter, etc.
 * @returns {Array<Object>} Filtered entries array.
 */
export function filterClientRoster(clientRoster, filterState) {
    try {
        if (!Array.isArray(clientRoster)) {
            return [];
        }

        const { searchQuery = '', statusFilter = 'ALL' } = filterState || {};
        const cleanSearchQuery = searchQuery.trim().toLowerCase();

        return clientRoster.filter((item) => {
            if (!item) return false;

            // 1. Evaluate Text Search Filter (DisplayName or primary ID)
            const matchSearch = cleanSearchQuery
                ? item.displayName.toLowerCase().includes(cleanSearchQuery) || String(item.id).toLowerCase().includes(cleanSearchQuery)
                : true;

            // 2. Evaluate Attendance Status Code Filter
            const matchStatus = statusFilter && statusFilter !== 'ALL'
                ? item.status === statusFilter
                : true;

            return matchSearch && matchStatus;
        });
    } catch (error) {
        console.error('[AttendanceUtils] Error filtering roster array:', error);
        return [];
    }
}

/**
 * Builds optimized, lightweight payload arrays containing strictly modified items.
 * @param {Object} draftDeltas - Current client-side memory delta changes dictionary.
 * @param {string} selectedDate - The selected target date for the ledger changes.
 * @returns {Array<Object>} Sparse list of updates ready for database mutation calls.
 */
export function compileMutationPayload(draftDeltas, selectedDate) {
    try {
        if (!draftDeltas || typeof draftDeltas !== 'object') {
            return [];
        }

        return Object.keys(draftDeltas).map((id) => ({
            id,
            date: selectedDate,
            ...draftDeltas[id]
        }));
    } catch (error) {
        console.error('[AttendanceUtils] Error packaging changes payload:', error);
        return [];
    }
}

/**
 * Validates HH:MM time syntax formats.
 * @param {string} timeString - The HH:MM string to test.
 * @returns {boolean} True if string is null or matches the correct format.
 */
export function validateTimeFormat(timeString) {
    if (!timeString) return true; // Empty states represent unrecorded clock entries, which is acceptable
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    return timeRegex.test(timeString);
}

/**
 * Combines student roster with database logs to build the daily baseline records.
 * @param {Array<Object>} batchStudents - Flat array of students enrolled in the batch.
 * @param {Array<Object>} recordedEntries - Flat array of attendance logs from database.
 * @param {string} selectedDate - Active filter date.
 * @param {string} start_time - Default schedule start time.
 * @param {string} end_time - Default schedule end time.
 * @returns {Array<Object>} Daily baseline array.
 */
export function buildStudentBaselineRegistry(batchStudents, recordedEntries, selectedDate, start_time, end_time) {
    if (!Array.isArray(batchStudents)) return [];
    const records = Array.isArray(recordedEntries) ? recordedEntries : [];

    return batchStudents.map((student) => {
        const recorded = records.find(r => r.student_id === (student.student_id || student.id));
        if (recorded) {
            let entryTime = recorded.entry_time || start_time || '08:00';
            let exitTime = recorded.exit_time || end_time || '13:00';
            if (entryTime && typeof entryTime === 'object') entryTime = formatStructuredToTime(entryTime);
            if (exitTime && typeof exitTime === 'object') exitTime = formatStructuredToTime(exitTime);

            return {
                ...recorded,
                student_name: recorded.student_name || student.student_name || student.full_name,
                roll_number: recorded.roll_number || student.roll_number,
                entry_time: entryTime,
                exit_time: exitTime,
                status: recorded.status || 'NR'
            };
        }

        return {
            attendance_id: null,
            student_id: student.student_id || student.id,
            student_name: student.student_name || student.full_name,
            roll_number: student.roll_number,
            status: 'NR',
            entry_time: start_time || '08:00',
            exit_time: end_time || '13:00',
            remarks: ''
        };
    });
}

/**
 * Matches teacher-batch assignments with daily logs, initializing baseline records.
 * @param {Array<Object>} teachers - Flat array of all teachers.
 * @param {Array<Object>} dailyLogs - Flat array of daily attendance logs.
 * @param {Array<Object>} batches - Flat array of all academic cohorts.
 * @param {string} selectedDate - Active register date string.
 * @returns {Array<Object>} Daily teacher-batch baseline array.
 */
export function buildTeacherBaselineRegistry(teachers, dailyLogs, batches, selectedDate) {
    if (!Array.isArray(teachers) || !Array.isArray(batches)) return [];
    const logs = Array.isArray(dailyLogs) ? dailyLogs : [];

    const todayStr = new Date().toLocaleDateString('sv-SE');
    const isToday = selectedDate === todayStr;
    const isPastDate = isPastLocalDate(selectedDate);

    const result = [];

    teachers.forEach(teacher => {
        const teacherBatches = batches.filter(b => b.teacher_id === teacher.teacher_id);

        teacherBatches.forEach(batch => {
            const matchingLog = logs.find(log => {
                if (log.teacher_id !== teacher.teacher_id) return false;
                if (log.batch_id !== batch.batch_id) return false;
                if (log.attendance_date) {
                    const logLocalDate = toLocalDate(log.attendance_date);
                    const logDateKey = formatToKey(logLocalDate);
                    return logDateKey === selectedDate;
                }
                return true;
            });

            const defaultIn = batch.schedule?.start_time || '08:00';
            const defaultOut = batch.schedule?.end_time || '16:00';

            let statusVal = 'P';
            let entryTimeStr = defaultIn;
            let exitTimeStr = defaultOut;
            let remarksStr = '';
            const isUnrecordedPast = !matchingLog && isPastDate;
            const isUnrecordedToday = !matchingLog && isToday;

            if (matchingLog) {
                statusVal = matchingLog.status || 'NR';
                if (statusVal === 'Absent') statusVal = 'A';
                else if (statusVal === 'Late') statusVal = 'L';
                else if (statusVal === 'Present') statusVal = 'P';

                entryTimeStr = formatStructuredToTime(matchingLog.entry_time) || defaultIn;
                exitTimeStr = formatStructuredToTime(matchingLog.exit_time) || defaultOut;
                remarksStr = matchingLog.remarks || '';
            } else if (isToday) {
                statusVal = 'NR';
            }

            const compositeKey = `${teacher.teacher_id}_${batch.batch_id}`;
            result.push({
                id: compositeKey,
                teacher_id: teacher.teacher_id,
                batch_id: batch.batch_id,
                batch_name: batch.batch_name || batch.name || batch.batch_id,
                full_name: teacher.full_name,
                phone: teacher.mobile_number,
                status: statusVal,
                entry_time: entryTimeStr,
                exit_time: exitTimeStr,
                remarks: remarksStr,
                isUnmarkedPastDate: isUnrecordedPast,
                isUnmarkedCurrentDate: isUnrecordedToday
            });
        });
    });

    return result;
}

/**
 * Compares staged changes against the baseline, evicting values that match the database state.
 * @param {Object} draftDeltas - Staged modifications.
 * @param {Array<Object>} serverRegistry - Original baseline registry.
 * @param {Object} domainConfig - Domain configuration configuration.
 * @returns {Object} Pruned delta dictionary.
 */
export function pruneRedundantChanges(draftDeltas, serverRegistry, domainConfig) {
    if (!draftDeltas || !serverRegistry || !domainConfig) return {};

    const pruned = { ...draftDeltas };
    const resolveId = domainConfig.resolveId;
    const hasTimeCapture = !!domainConfig.hasTimeCapture;

    Object.keys(pruned).forEach(id => {
        const delta = pruned[id];
        const serverMatch = serverRegistry.find(row => resolveId(row) === id);

        if (serverMatch) {
            let serverStatus = serverMatch.status;
            if (serverStatus === null || serverStatus === undefined || serverStatus === '') {
                serverStatus = 'NR';
            }

            const isStatusReverted =
                delta.status === undefined || delta.status === serverStatus;
            const isRemarksReverted =
                delta.remarks === undefined ||
                delta.remarks.trim() === (serverMatch.remarks || '').trim();

            let isEntryTimeReverted = true;
            let isExitTimeReverted = true;

            if (hasTimeCapture) {
                let serverIn = serverMatch.entry_time || null;
                let serverOut = serverMatch.exit_time || null;
                if (serverIn && typeof serverIn === 'object') serverIn = formatStructuredToTime(serverIn);
                if (serverOut && typeof serverOut === 'object') serverOut = formatStructuredToTime(serverOut);

                isEntryTimeReverted =
                    delta.entry_time === undefined || delta.entry_time === serverIn;
                isExitTimeReverted =
                    delta.exit_time === undefined || delta.exit_time === serverOut;
            }

            if (isStatusReverted && isRemarksReverted && isEntryTimeReverted && isExitTimeReverted) {
                delete pruned[id];
            }
        }
    });

    return pruned;
}

/**
 * Generates delta updates object to mark all records with a target status.
 * @param {Array<Object>} roster - Active roster items.
 * @param {string} targetStatus - New status value to apply.
 * @param {Object} domainConfig - Domain configuration.
 * @returns {Object} Staging delta adjustments object.
 */
export function getBulkStatusUpdates(roster, targetStatus, domainConfig) {
    if (!Array.isArray(roster) || !domainConfig) return {};
    const updates = {};
    const resolveId = domainConfig.resolveId;
    const hasTimeCapture = !!domainConfig.hasTimeCapture;
    const defaultIn = domainConfig.defaultEntryTime || '08:00';
    const defaultOut = domainConfig.defaultExitTime || '16:00';

    roster.forEach(row => {
        const id = resolveId(row);
        if (!id) return;

        if (row.status !== targetStatus) {
            const isAbsentOrNR = targetStatus === 'A' || targetStatus === 'NR';

            updates[id] = {
                status: targetStatus,
                entry_time: isAbsentOrNR ? null : (hasTimeCapture ? defaultIn : null),
                exit_time: isAbsentOrNR ? null : (hasTimeCapture ? defaultOut : null)
            };
        }
    });

    return updates;
}

/**
 * Validates status and time formats for rows in the roster.
 * @param {Array<Object>} roster - Client roster rows.
 * @param {Object} domainConfig - Domain configuration.
 * @returns {Object} Object indicating if validation passed and details of any errors.
 */
export function validateRoster(roster, domainConfig) {
    if (!Array.isArray(roster) || !domainConfig) {
        return { isValid: true, errors: [] };
    }

    const errors = [];
    const hasTimeCapture = !!domainConfig.hasTimeCapture;

    roster.forEach(row => {
        const displayName = domainConfig.resolveName(row);
        const status = row.status;

        if ((status === 'P' || status === 'L') && hasTimeCapture) {
            if (row.entry_time && !validateTimeFormat(row.entry_time)) {
                errors.push(`Invalid punch-in time format for ${displayName} (${row.entry_time}). Must match HH:MM.`);
            }
            if (row.exit_time && !validateTimeFormat(row.exit_time)) {
                errors.push(`Invalid punch-out time format for ${displayName} (${row.exit_time}). Must match HH:MM.`);
            }
        }
    });

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Compiles a transaction payload based on the strategy and mode selected.
 * @param {Object} params - Input configuration parameters.
 * @param {string} params.commitMode - Mode of commit: individual, delta, or all.
 * @param {Object} params.draftDeltas - Staged delta modifications.
 * @param {Array<Object>} params.roster - Current client-side active roster list.
 * @param {Object} params.domainConfig - Active attendance domain configuration.
 * @param {Object} params.filterState - Current filters containing dates and ids.
 * @param {Object} [params.individualRow=null] - Single row item for individual commits.
 * @returns {Object|null} Compiled transaction payload ready for mutation.
 */
export function compileStrategyPayload({
    commitMode,
    draftDeltas,
    roster,
    domainConfig,
    filterState,
    individualRow = null
}) {
    const { transformPayload } = domainConfig;
    if (typeof transformPayload !== 'function') {
        throw new Error('transformPayload is not a function in domainConfig.');
    }

    let rawUpdates = [];

    if (commitMode === 'individual') {
        if (!individualRow) return null;
        rawUpdates = [{ id: domainConfig.resolveId(individualRow), ...individualRow }];
    } else if (commitMode === 'delta') {
        const alteredIds = Object.keys(draftDeltas);
        rawUpdates = alteredIds.map(id => {
            const consolidatedRow = roster.find(r => r.id === id);
            return { id, ...consolidatedRow };
        });
    } else if (commitMode === 'all') {
        rawUpdates = roster.map(item => ({ id: item.id, ...item }));
    }

    const payloadFilterState = { ...filterState, commitMode };
    return transformPayload(rawUpdates, payloadFilterState, roster);
}

/**
 * Indexes flat teacher history logs into an O(1) date-keyed map.
 * @param {Array<Object>} attendanceArray - Raw query log rows.
 * @returns {Object} Index map: { "YYYY-MM-DD": record }
 */
export function normalizeAttendanceList(attendanceArray) {
    if (!Array.isArray(attendanceArray)) return {};

    return attendanceArray.reduce((acc, record) => {
        if (!record?.attendance_date) return acc;

        const localDate = toLocalDate(record.attendance_date);
        const dateKey = formatToKey(localDate);

        if (dateKey) {
            acc[dateKey] = {
                ...record,
                _localDateInstance: localDate
            };
        }
        return acc;
    }, {});
}

/**
 * Computes monthly calendar metrics (total working days, late logs, shift hours).
 * @param {Object} indexedData - Map of YYYY-MM-DD keyed records.
 * @param {number} currentYear
 * @param {number} currentMonth - 0-indexed month.
 * @returns {Object} Monthly analytics KPIs.
 */
export function calculateMonthlyStats(indexedData, currentYear, currentMonth) {
    let presentDays = 0;
    let lateDays = 0;
    let absentDays = 0;
    let totalHours = 0;

    Object.keys(indexedData).forEach((dateKey) => {
        const record = indexedData[dateKey];
        const recordDate = record._localDateInstance;

        if (recordDate && recordDate.getFullYear() === currentYear && recordDate.getMonth() === currentMonth) {
            const status = record.status?.toUpperCase();

            if (status === 'P' || status === 'PRESENT') presentDays++;
            else if (status === 'L' || status === 'LATE') lateDays++;
            else if (status === 'A' || status === 'ABSENT') absentDays++;

            totalHours += record.duration || 0;
        }
    });

    const activeWorkedCount = presentDays + lateDays;
    const avgHours = activeWorkedCount > 0 ? (totalHours / activeWorkedCount).toFixed(1) : '0.0';

    return {
        presentDays,
        lateDays,
        absentDays,
        totalWorkingDays: presentDays + lateDays + absentDays || 22,
        totalHours: totalHours.toFixed(1),
        avgHours
    };
}

/**
 * Normalizes input updates from the Punch Editor Modal into API format.
 * @param {Object} updates - Raw editor changes.
 * @returns {Object} Normalized database payload update object.
 */
export function formatSinglePunchUpdate(updates) {
    const finalUpdates = {};

    if (updates.status === 'present') finalUpdates.status = 'P';
    else if (updates.status === 'absent') finalUpdates.status = 'A';
    else if (updates.status === 'leave') finalUpdates.status = 'L';
    else finalUpdates.status = updates.status;

    if (updates.check_in_time) {
        finalUpdates.entry_time = parseTimeToStructured(updates.check_in_time);
    }
    if (updates.check_out_time) {
        finalUpdates.exit_time = parseTimeToStructured(updates.check_out_time);
    }
    if (updates.remarks !== undefined) {
        finalUpdates.remarks = updates.remarks;
    }

    if (finalUpdates.status === 'A' || finalUpdates.status === 'NR') {
        finalUpdates.entry_time = null;
        finalUpdates.exit_time = null;
    }

    return finalUpdates;
}