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
import ResponseModal from '../../../../components/ui/ResponseModal';
import WhatsAppShareModal from './tests/components/WhatsAppShareModal';
import ConsolidatedMarksheetKPIs from './tests/components/ConsolidatedMarksheetKPIs';
import ConsolidatedMarksheetTable from './tests/components/ConsolidatedMarksheetTable';
import FlashAlert from '../../../../components/ui/v2/FlashAlert';
import {
  formatTestSummaryWhatsAppMessage,
  formatStudentMarksheetWhatsAppMessage,
  formatConsolidatedMarksheetWhatsAppMessage
} from './tests/utils/whatsappShareUtils';
import {
  exportConsolidatedMarksheetPDF,
  shareConsolidatedMarksheetPDFToWhatsApp
} from './tests/utils/pdfExporterUtils';

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
import { calculateConsolidatedBatchMarksheet } from './tests/utils/marksheetCalculators';

export default function BatchTestsTab({ batch, batchId }) {
  const currentBatchId = batchId || batch?.id;

  // View state: 'list' | 'marks_entry' | 'report'
  const [activeStage, setActiveStage] = useState('list');
  const [selectedTest, setSelectedTest] = useState(null);

  // View mode switcher: 'list' | 'marksheet'
  const [viewMode, setViewMode] = useState('list');

  // List filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Response Feedback Modal State
  const [responseModalConfig, setResponseModalConfig] = useState({
    isOpen: false,
    variant: 'success',
    title: '',
    subtitle: '',
    items: [],
    errorObj: null,
    onRetry: null
  });

  const handleResponseModalClose = () => {
    setResponseModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  // WhatsApp Preview Modal State
  const [whatsAppPreviewModalConfig, setWhatsAppPreviewModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    phone: ''
  });

  const handleCloseWhatsAppPreviewModal = () => {
    setWhatsAppPreviewModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  // Flash Alert State for status responses & feedback notifications
  const [flashAlertConfig, setFlashAlertConfig] = useState({
    isOpen: false,
    variant: 'success',
    title: '',
    description: '',
    autoDismissMs: 3500
  });

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

  // Consolidated Batch Marksheet Calculations
  const consolidatedMarksheetData = useMemo(() => {
    return calculateConsolidatedBatchMarksheet(tests, students);
  }, [tests, students]);

  const handleOpenConsolidatedWhatsAppShare = () => {
    const msg = formatConsolidatedMarksheetWhatsAppMessage(batch, consolidatedMarksheetData);
    setWhatsAppPreviewModalConfig({
      isOpen: true,
      title: `Share Consolidated Marksheet: ${batch?.batch_name || 'Batch'}`,
      message: msg,
      phone: ''
    });
  };

  const handleExportConsolidatedPDF = () => {
    try {
      exportConsolidatedMarksheetPDF(batch, consolidatedMarksheetData);
      setFlashAlertConfig({
        isOpen: true,
        variant: 'success',
        title: 'PDF Downloaded',
        description: 'Consolidated marksheet PDF report generated successfully.',
        autoDismissMs: 3500
      });
    } catch (err) {
      console.error('[BatchTestsTab] Failed to generate PDF:', err);
      setFlashAlertConfig({
        isOpen: true,
        variant: 'error',
        title: 'PDF Generation Failed',
        description: err.message || 'Unable to generate PDF document.',
        autoDismissMs: 5000
      });
    }
  };

  const handleSharePDFWhatsApp = () => {
    try {
      shareConsolidatedMarksheetPDFToWhatsApp(batch, consolidatedMarksheetData, setFlashAlertConfig);
    } catch (err) {
      console.error('[BatchTestsTab] Failed to share PDF to WhatsApp:', err);
      setFlashAlertConfig({
        isOpen: true,
        variant: 'error',
        title: 'Share Failed',
        description: err.message || 'Unable to share PDF document.',
        autoDismissMs: 5000
      });
    }
  };

  // Handle direct status change from TestCard dropdown with FlashAlert feedback
  const handleStatusChange = async (testId, newStatus) => {
    try {
      await updateTestMutation.mutateAsync({
        id: testId,
        batch_id: currentBatchId,
        status: newStatus
      });

      setFlashAlertConfig({
        isOpen: true,
        variant: 'success',
        title: 'Test Status Updated',
        description: `Test status successfully changed to "${newStatus}".`,
        autoDismissMs: 3500
      });
    } catch (err) {
      console.error('[BatchTestsTab] Failed to update test status:', err);
      setFlashAlertConfig({
        isOpen: true,
        variant: 'error',
        title: 'Status Update Failed',
        description: err.message || 'Unable to update test status on backend database.',
        autoDismissMs: 5000
      });
    }
  };

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

        setResponseModalConfig({
          isOpen: true,
          variant: 'success',
          title: 'Test Updated Successfully',
          subtitle: `Changes to test "${formData.title}" have been saved.`,
          items: [
            { label: 'Test Title', value: formData.title },
            { label: 'Total Marks', value: `${formData.total_marks}` },
            { label: 'Passing Marks', value: `${formData.passing_marks}` },
            { label: 'Status', value: formData.status || 'Draft', isHighlight: true }
          ],
          errorObj: null,
          onRetry: null
        });
      } else {
        await createTestMutation.mutateAsync({
          batch_id: currentBatchId,
          ...formData
        });

        setResponseModalConfig({
          isOpen: true,
          variant: 'success',
          title: 'Test Created Successfully',
          subtitle: `New test "${formData.title}" has been added to this batch.`,
          items: [
            { label: 'Test Title', value: formData.title },
            { label: 'Total Marks', value: `${formData.total_marks}` },
            { label: 'Passing Marks', value: `${formData.passing_marks}` },
            { label: 'Status', value: formData.status || 'Draft', isHighlight: true }
          ],
          errorObj: null,
          onRetry: null
        });
      }
      setIsModalOpen(false);
      setEditingTest(null);
    } catch (err) {
      console.error('[BatchTestsTab] Failed to save test:', err);
      setResponseModalConfig({
        isOpen: true,
        variant: 'error',
        title: editingTest ? 'Failed to Update Test' : 'Failed to Create Test',
        subtitle: 'An error occurred while communicating with the backend database.',
        errorObj: {
          code: err.code || 'TEST_SAVE_ERROR',
          message: err.message || 'Unable to save test configuration.'
        },
        items: [],
        onRetry: () => handleModalSubmit(formData)
      });
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

  const handleOpenTestWhatsAppShare = (testToShare) => {
    const targetTest = testToShare || selectedTest;
    if (!targetTest) return;

    // Calculate report data if sharing from list view
    let targetReport = reportData;
    if (!targetReport || selectedTest?.id !== targetTest.id) {
      const testMarks = targetTest.marks || [];
      targetReport = calculateTestReport(testMarks, targetTest.total_marks, targetTest.passing_marks);
    }

    const msg = formatTestSummaryWhatsAppMessage(
      targetTest,
      batch,
      targetReport?.kpis || {},
      targetReport?.toppers || [],
      studentsMap,
      targetReport?.studentResults || []
    );

    setWhatsAppPreviewModalConfig({
      isOpen: true,
      title: `Share Report: ${targetTest.title}`,
      message: msg,
      phone: ''
    });
  };

  const handleOpenStudentWhatsAppShare = (resultRow) => {
    const studentInfo = studentsMap[resultRow.student_id];
    const phone = studentInfo?.student?.mobile_number || studentInfo?.mobile || studentInfo?.student?.phone || '';
    const msg = formatStudentMarksheetWhatsAppMessage(studentInfo, selectedTest, resultRow);

    setWhatsAppPreviewModalConfig({
      isOpen: true,
      title: `Share Marksheet: ${studentInfo?.student?.student_name || resultRow.student_id}`,
      message: msg,
      phone: phone
    });
  };

  const handleMarkChange = (studentId, updatedRowData) => {
    setMarksState(prev => ({
      ...prev,
      [studentId]: updatedRowData
    }));
  };

  const handleSaveAllMarks = async () => {
    if (!selectedTest) return;
    const recordsToSave = Object.values(marksState);
    try {
      await saveBulkMarksMutation.mutateAsync({
        test_id: selectedTest.id,
        marksRecords: recordsToSave
      });

      setResponseModalConfig({
        isOpen: true,
        variant: 'success',
        title: 'Student Marks Saved Successfully',
        subtitle: `Marks records for test "${selectedTest.title}" have been committed to the database.`,
        items: [
          { label: 'Test Title', value: selectedTest.title },
          { label: 'Students Evaluated', value: `${recordsToSave.length}`, isHighlight: true },
          { label: 'Batch ID', value: currentBatchId, isMono: true },
          { label: 'Saved At', value: new Date().toLocaleTimeString(), fullWidth: true }
        ],
        errorObj: null,
        onRetry: null
      });

      setActiveStage('list');
      setSelectedTest(null);
    } catch (err) {
      console.error('[BatchTestsTab] Save marks failure:', err);
      setResponseModalConfig({
        isOpen: true,
        variant: 'error',
        title: 'Failed to Save Student Marks',
        subtitle: 'An error occurred while committing student test scores.',
        errorObj: {
          code: err.code || 'BULK_MARKS_SAVE_ERROR',
          message: err.message || 'Failed to submit bulk marks payload.'
        },
        items: [],
        onRetry: handleSaveAllMarks
      });
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
              variant="outlined"
              startIcon="chat"
              onClick={() => handleOpenTestWhatsAppShare(selectedTest)}
              className="!text-emerald-600 !border-emerald-500/30 hover:!bg-emerald-500/10"
            >
              Share Report
            </Button>
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
                <TopPerformersCard
                  toppers={reportData?.toppers}
                  studentsMap={studentsMap}
                  totalMarks={selectedTest.total_marks}
                />
              </div>

              <div className="lg:col-span-2">
                <StudentResultTable
                  results={reportData?.studentResults}
                  studentsMap={studentsMap}
                  totalMarks={selectedTest.total_marks}
                  onShareWhatsApp={handleOpenStudentWhatsAppShare}
                />
              </div>
            </div>
          </>
        )}

        <ResponseModal
          isOpen={responseModalConfig.isOpen}
          onClose={handleResponseModalClose}
          variant={responseModalConfig.variant}
          title={responseModalConfig.title}
          subtitle={responseModalConfig.subtitle}
          items={responseModalConfig.items}
          errorObj={responseModalConfig.errorObj}
          onRetry={responseModalConfig.onRetry}
        />

        <WhatsAppShareModal
          isOpen={whatsAppPreviewModalConfig.isOpen}
          onClose={handleCloseWhatsAppPreviewModal}
          title={whatsAppPreviewModalConfig.title}
          message={whatsAppPreviewModalConfig.message}
          phone={whatsAppPreviewModalConfig.phone}
        />
      </div>
    );
  }

  // Stage 1: Tests View (Default)
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
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode === 'marksheet' ? (
        <>
          <ConsolidatedMarksheetKPIs
            batchKPIs={consolidatedMarksheetData.batchKPIs}
          />
          <ConsolidatedMarksheetTable
            studentRows={consolidatedMarksheetData.studentRows}
            testColumns={consolidatedMarksheetData.testColumns}
            isLoading={isTestsLoading}
            onShareWhatsApp={handleOpenConsolidatedWhatsAppShare}
            onExportPDF={handleExportConsolidatedPDF}
            onSharePDFWhatsApp={handleSharePDFWhatsApp}
          />
        </>
      ) : (
        <TestsList
          tests={filteredTests}
          isLoading={isTestsLoading}
          studentsCount={students.length}
          onEnterMarks={handleEnterMarksOpen}
          onViewReport={handleViewReportOpen}
          onShareWhatsApp={handleOpenTestWhatsAppShare}
          onEdit={handleEditOpen}
          onDelete={(test) => setDeleteTarget(test)}
          onStatusChange={handleStatusChange}
        />
      )}

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

      <ResponseModal
        isOpen={responseModalConfig.isOpen}
        onClose={handleResponseModalClose}
        variant={responseModalConfig.variant}
        title={responseModalConfig.title}
        subtitle={responseModalConfig.subtitle}
        items={responseModalConfig.items}
        errorObj={responseModalConfig.errorObj}
        onRetry={responseModalConfig.onRetry}
      />

      <WhatsAppShareModal
        isOpen={whatsAppPreviewModalConfig.isOpen}
        onClose={handleCloseWhatsAppPreviewModal}
        title={whatsAppPreviewModalConfig.title}
        message={whatsAppPreviewModalConfig.message}
        phone={whatsAppPreviewModalConfig.phone}
      />

      {/* Floating Top-Right FlashAlert Toast Container */}
      <div className="fixed top-20 right-6 z-50 pointer-events-auto">
        <FlashAlert
          isOpen={flashAlertConfig.isOpen}
          variant={flashAlertConfig.variant}
          title={flashAlertConfig.title}
          description={flashAlertConfig.description}
          autoDismissMs={flashAlertConfig.autoDismissMs}
          onClose={() => setFlashAlertConfig(prev => ({ ...prev, isOpen: false }))}
        />
      </div>
    </div>
  );
}
