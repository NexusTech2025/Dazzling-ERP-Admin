import React, { useState, useEffect, useMemo } from 'react';
import TestsToolbar from './tests/components/TestsToolbar';
import TestsList from './tests/components/TestsList';
import TestFormModal from './tests/components/TestFormModal';
import MarksEntryHeader from './tests/components/MarksEntryHeader';
import MarksEntryTable from './tests/components/MarksEntryTable';
import TestReportKPIs from './tests/components/TestReportKPIs';
import TopPerformersCard from './tests/components/TopPerformersCard';
import StudentResultTable from './tests/components/StudentResultTable';
import ConfirmModal from '../../../../components/ui/ConfirmModal';
import Button from '../../../../components/ui/v2/Button';
import RefreshButton from '../../../../components/ui/btn/RefreshButton';

import {
  useBatchTestsQuery,
  useTestMarksQuery,
  useCreateTestMutation,
  useUpdateTestMutation,
  useDeleteTestMutation,
  useSaveBulkMarksMutation
} from '../../hooks/useBatchTestQueries';
import { useBatchStudentsQuery } from '../../hooks/useBatchQueries';
import { calculateTestReport } from './tests/utils/testCalculators';

export default function BatchTestsTab({ batch, batchId }) {
  const currentBatchId = batchId || batch?.id;

  // View state: 'list' | 'marks_entry' | 'report'
  const [activeStage, setActiveStage] = useState('list');
  const [selectedTest, setSelectedTest] = useState(null);

  // List filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Bulk marks local state map: { [student_id]: { student_id, obtained_marks, is_absent, remarks } }
  const [marksState, setMarksState] = useState({});

  // Queries & Mutations
  const {
    data: tests = [],
    isLoading: isTestsLoading,
    isFetching: isTestsFetching,
    refetch: refetchTests
  } = useBatchTestsQuery(currentBatchId);

  const { data: students = [] } = useBatchStudentsQuery(currentBatchId);

  const testMarksRecords = useTestMarksQuery(currentBatchId, selectedTest?.id);
  const isMarksLoading = false;

  const isRefreshing = isTestsFetching;

  const handleRefresh = async () => {
    await refetchTests();
  };

  const createTestMutation = useCreateTestMutation();
  const updateTestMutation = useUpdateTestMutation();
  const deleteTestMutation = useDeleteTestMutation();
  const saveBulkMarksMutation = useSaveBulkMarksMutation();

  // Populate marksState when entering marks_entry stage or when testMarksRecords loads
  useEffect(() => {
    if (activeStage === 'marks_entry' && students.length > 0) {
      const initialMap = {};
      
      // First populate default student entries
      students.forEach(s => {
        const sId = s.student_id || s.id || s.allocation_id;
        initialMap[sId] = {
          student_id: sId,
          obtained_marks: '',
          is_absent: false,
          remarks: ''
        };
      });

      // Overlay existing saved marks records
      if (testMarksRecords && testMarksRecords.length > 0) {
        testMarksRecords.forEach(m => {
          const sId = m.student_id;
          if (sId && initialMap[sId]) {
            initialMap[sId] = {
              student_id: sId,
              obtained_marks: m.is_absent ? '' : (m.obtained_marks ?? ''),
              is_absent: Boolean(m.is_absent),
              remarks: m.remarks || ''
            };
          }
        });
      }

      setMarksState(initialMap);
    }
  }, [activeStage, students, testMarksRecords]);

  // Filtered tests list
  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchesSearch = (test.title || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'ALL' || test.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [tests, searchQuery, selectedStatus]);

  // Map of student details by student_id
  const studentsMap = useMemo(() => {
    const map = {};
    students.forEach(s => {
      const sId = s.student_id || s.id || s.allocation_id;
      map[sId] = s;
    });
    return map;
  }, [students]);

  // Calculated analytics for selected test
  const reportData = useMemo(() => {
    if (!selectedTest) return null;
    return calculateTestReport(testMarksRecords, selectedTest.total_marks, selectedTest.passing_marks);
  }, [selectedTest, testMarksRecords]);

  // Actions
  const handleCreateOpen = () => {
    setEditingTest(null);
    setIsModalOpen(true);
  };

  const handleEditOpen = (test) => {
    setEditingTest(test);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    try {
      if (editingTest) {
        await updateTestMutation.mutateAsync({
          id: editingTest.id,
          batch_id: currentBatchId,
          ...formData
        });
      } else {
        await createTestMutation.mutateAsync({
          batch_id: currentBatchId,
          ...formData
        });
      }
      setIsModalOpen(false);
      setEditingTest(null);
    } catch (err) {
      console.error('[BatchTestsTab] Failed to save test:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTestMutation.mutateAsync({
        id: deleteTarget.id,
        batch_id: currentBatchId
      });
      setDeleteTarget(null);
    } catch (err) {
      console.error('[BatchTestsTab] Delete test error:', err);
    }
  };

  const handleEnterMarksOpen = (test) => {
    setSelectedTest(test);
    setActiveStage('marks_entry');
  };

  const handleViewReportOpen = (test) => {
    setSelectedTest(test);
    setActiveStage('report');
  };

  const handleMarkChange = (studentId, updatedRowData) => {
    setMarksState(prev => ({
      ...prev,
      [studentId]: updatedRowData
    }));
  };

  const handleSaveAllMarks = async () => {
    if (!selectedTest) return;
    try {
      const recordsToSave = Object.values(marksState);
      await saveBulkMarksMutation.mutateAsync({
        test_id: selectedTest.id,
        marksRecords: recordsToSave
      });
      setActiveStage('list');
      setSelectedTest(null);
    } catch (err) {
      console.error('[BatchTestsTab] Save marks failure:', err);
    }
  };

  // Stage 2: Marks Entry View
  if (activeStage === 'marks_entry' && selectedTest) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <MarksEntryHeader
          test={selectedTest}
          batch={batch}
          onBack={() => { setActiveStage('list'); setSelectedTest(null); }}
          onSave={handleSaveAllMarks}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          isSaving={saveBulkMarksMutation.isPending}
        />

        <MarksEntryTable
          students={students}
          marksState={marksState}
          totalMarks={selectedTest.total_marks}
          onMarkChange={handleMarkChange}
        />
      </div>
    );
  }

  // Stage 3: Test Report View
  if (activeStage === 'report' && selectedTest) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="outlined"
              size="sm"
              startIcon="arrow_back"
              onClick={() => { setActiveStage('list'); setSelectedTest(null); }}
            >
              Back to Tests
            </Button>
            <div>
              <h3 className="text-lg font-bold text-text-main dark:text-white">
                {selectedTest.title} — Analytics & Report
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Total Marks: <span className="font-semibold text-text-main dark:text-white">{selectedTest.total_marks}</span> • Passing Marks: <span className="font-semibold text-text-main dark:text-white">{selectedTest.passing_marks}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <RefreshButton
              isFetching={isRefreshing}
              onRefresh={handleRefresh}
            />
            <Button
              variant="contained"
              startIcon="edit_note"
              onClick={() => setActiveStage('marks_entry')}
            >
              Edit Student Marks
            </Button>
          </div>
        </div>

        {isMarksLoading ? (
          <div className="py-20 text-center bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl block mb-2">progress_activity</span>
            <p className="text-sm text-text-secondary">Loading test results and report analytics...</p>
          </div>
        ) : (
          <>
            <TestReportKPIs kpis={reportData?.kpis} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <TopPerformersCard toppers={reportData?.toppers} totalMarks={selectedTest.total_marks} />
              </div>

              <div className="lg:col-span-2">
                <StudentResultTable
                  results={reportData?.studentResults}
                  studentsMap={studentsMap}
                  totalMarks={selectedTest.total_marks}
                />
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Stage 1: Tests List View (Default)
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <TestsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onCreateClick={handleCreateOpen}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <TestsList
        tests={filteredTests}
        isLoading={isTestsLoading}
        studentsCount={students.length}
        onEnterMarks={handleEnterMarksOpen}
        onViewReport={handleViewReportOpen}
        onEdit={handleEditOpen}
        onDelete={(test) => setDeleteTarget(test)}
      />

      <TestFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTest(null); }}
        onSubmit={handleModalSubmit}
        initialData={editingTest}
        isSubmitting={createTestMutation.isPending || updateTestMutation.isPending}
      />

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Test"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All student marks associated with this test will also be deleted.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteTestMutation.isPending}
      />
    </div>
  );
}
