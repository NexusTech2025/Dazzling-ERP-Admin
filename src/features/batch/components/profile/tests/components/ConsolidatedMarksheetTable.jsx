import React, { useState, useMemo } from 'react';
import Card from '../../../../../../components/ui/Card';
import TextInput from '../../../../../../components/ui/v2/TextInput';
import Button from '../../../../../../components/ui/v2/Button';
import Badge from '../../../../../../components/ui/Badge';

/**
 * Interactive full-width matrix table rendering the primary consolidated batch marksheet view.
 * Displays numeric test scores, test total marks in headers, sticky student & summary columns,
 * live search filtering, score display mode toggle (Raw Marks vs Percentage), and batch rank badges.
 * 
 * @component
 * @param {Object} props
 * @param {Array<Object>} props.studentRows - Calculated student matrix rows.
 * @param {Array<Object>} props.testColumns - List of conducted test columns.
 * @param {boolean} [props.isLoading=false] - Loading indicator state.
 * @param {Function} [props.onShareWhatsApp] - Secondary callback to trigger WhatsApp preview modal.
 */
export default function ConsolidatedMarksheetTable({
  studentRows = [],
  testColumns = [],
  isLoading = false,
  onShareWhatsApp,
  onExportPDF,
  onSharePDFWhatsApp
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [displayMode, setDisplayMode] = useState('raw'); // 'raw' | 'percentage'

  // Filter student rows based on search query (name or roll number)
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return studentRows;
    const query = searchQuery.toLowerCase().trim();
    return studentRows.filter(s =>
      s.studentName.toLowerCase().includes(query) ||
      String(s.rollNo || '').toLowerCase().includes(query)
    );
  }, [studentRows, searchQuery]);

  if (isLoading) {
    return (
      <Card variant="default" className="py-16 text-center">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl block mb-2">progress_activity</span>
        <p className="text-sm text-text-secondary">Generating consolidated batch marksheet matrix...</p>
      </Card>
    );
  }

  if (!testColumns.length) {
    return (
      <Card variant="default" className="py-16 text-center">
        <span className="material-symbols-outlined text-text-secondary text-5xl mb-3">grid_off</span>
        <h4 className="text-base font-bold text-text-main dark:text-white">No Evaluated Tests Found</h4>
        <p className="text-xs text-text-secondary max-w-md mx-auto mt-1">
          Create and enter student marks for tests in this batch to generate the consolidated marksheet view.
        </p>
      </Card>
    );
  }

  return (
    <Card variant="default" className="overflow-hidden border border-border-light dark:border-border-dark">
      {/* Table Toolbar Controls */}
      <Card.Header border={true} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-surface-light dark:bg-surface-dark">
        <div className="w-full sm:w-72">
          <TextInput
            placeholder="Search student by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startIcon="search"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
          {/* Score Display Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/60 p-1 rounded-lg border border-border-light dark:border-border-dark text-xs font-semibold">
            <button
              type="button"
              onClick={() => setDisplayMode('raw')}
              className={`px-3 py-1 rounded-md transition-all ${
                displayMode === 'raw'
                  ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-main dark:hover:text-white'
              }`}
            >
              Raw Marks
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('percentage')}
              className={`px-3 py-1 rounded-md transition-all ${
                displayMode === 'percentage'
                  ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-main dark:hover:text-white'
              }`}
            >
              Percentage (%)
            </button>
          </div>

          {/* Download PDF Action */}
          {onExportPDF && (
            <Button
              variant="outlined"
              size="sm"
              startIcon="picture_as_pdf"
              onClick={onExportPDF}
              className="!text-rose-600 !border-rose-500/30 hover:!bg-rose-500/10"
            >
              Download PDF
            </Button>
          )}

          {/* Share PDF to WhatsApp Action */}
          {onSharePDFWhatsApp && (
            <Button
              variant="contained"
              size="sm"
              startIcon="share"
              onClick={onSharePDFWhatsApp}
              className="!bg-emerald-600 hover:!bg-emerald-700 !text-white"
            >
              Share PDF
            </Button>
          )}

          {/* Text Summary Broadcast Trigger */}
          {onShareWhatsApp && (
            <Button
              variant="outlined"
              size="sm"
              startIcon="chat"
              onClick={onShareWhatsApp}
              className="!text-emerald-600 !border-emerald-500/30 hover:!bg-emerald-500/10"
            >
              Share Text
            </Button>
          )}
        </div>
      </Card.Header>

      {/* Matrix Table View */}
      <Card.Body className="!p-0">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-xs text-left border-collapse">
            {/* Header Row */}
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/90 text-text-secondary border-b border-border-light dark:border-border-dark font-semibold">
                {/* Sticky Left Index & Student Columns */}
                <th className="py-3 px-3 w-12 text-center sticky left-0 z-20 bg-slate-100 dark:bg-slate-800 border-r border-border-light dark:border-border-dark">
                  #
                </th>
                <th className="py-3 px-4 min-w-[180px] max-w-[220px] sticky left-12 z-20 bg-slate-100 dark:bg-slate-800 border-r border-border-light dark:border-border-dark shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Student Name
                </th>

                {/* Per-Test Header Columns with Title & Total Marks */}
                {testColumns.map(test => (
                  <th
                    key={test.id}
                    className="py-3 px-4 min-w-[110px] text-center border-r border-border-light dark:border-border-dark"
                  >
                    <div className="font-bold text-text-main dark:text-white truncate max-w-[130px] mx-auto" title={test.title}>
                      {test.title}
                    </div>
                    <div className="text-[10px] text-primary dark:text-primary-light font-medium mt-0.5">
                      (Max: {test.totalMarks})
                    </div>
                  </th>
                ))}

                {/* Sticky Right Summary Columns */}
                <th className="py-3 px-4 w-28 text-center sticky right-24 z-20 bg-slate-100 dark:bg-slate-800 border-l border-border-light dark:border-border-dark shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Total Marks
                </th>
                <th className="py-3 px-4 w-24 text-center sticky right-0 z-20 bg-slate-100 dark:bg-slate-800 border-l border-border-light dark:border-border-dark">
                  Rank
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={testColumns.length + 4} className="py-8 text-center text-text-secondary">
                    No students matching search query "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredStudents.map((row) => (
                  <tr
                    key={row.studentId}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Index */}
                    <td className="py-2.5 px-3 text-center text-text-secondary font-mono sticky left-0 z-10 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark">
                      {row.batchRank}
                    </td>

                    {/* Student Name */}
                    <td className="py-2.5 px-4 font-semibold text-text-main dark:text-white sticky left-12 z-10 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] truncate max-w-[220px]">
                      {row.studentName}
                    </td>

                    {/* Per-Test Score Cells */}
                    {testColumns.map((test) => {
                      const scoreInfo = row.testScores[test.id];
                      if (!scoreInfo || scoreInfo.status === 'NOT_EVALUATED') {
                        return (
                          <td key={test.id} className="py-2.5 px-4 text-center text-slate-400 border-r border-border-light dark:border-border-dark">
                            -
                          </td>
                        );
                      }

                      if (scoreInfo.isAbsent) {
                        return (
                          <td key={test.id} className="py-2.5 px-4 text-center border-r border-border-light dark:border-border-dark">
                            <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-[11px]">
                              ABS
                            </span>
                          </td>
                        );
                      }

                      // Render numeric mark or percentage
                      const isPass = scoreInfo.isPass;
                      const cellValue = displayMode === 'percentage'
                        ? `${((scoreInfo.score / test.totalMarks) * 100).toFixed(1)}%`
                        : scoreInfo.score;

                      return (
                        <td key={test.id} className="py-2.5 px-4 text-center font-mono font-bold border-r border-border-light dark:border-border-dark">
                          <span className={`inline-block px-2 py-0.5 rounded ${
                            isPass
                              ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10'
                              : 'text-rose-700 dark:text-rose-400 bg-rose-500/10'
                          }`}>
                            {cellValue}
                          </span>
                        </td>
                      );
                    })}

                    {/* Aggregate Total Marks */}
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-text-main dark:text-white sticky right-24 z-10 bg-surface-light dark:bg-surface-dark border-l border-border-light dark:border-border-dark shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      {row.totalObtained} / {row.totalMaxPossible}
                      <div className="text-[10px] text-text-secondary font-normal">
                        ({row.cumulativePercentage}%)
                      </div>
                    </td>

                    {/* Batch Rank Badge */}
                    <td className="py-2.5 px-4 text-center sticky right-0 z-10 bg-surface-light dark:bg-surface-dark border-l border-border-light dark:border-border-dark">
                      {row.batchRank === 1 ? (
                        <Badge variant="success" className="!font-bold">🥇 1st</Badge>
                      ) : row.batchRank === 2 ? (
                        <Badge variant="info" className="!font-bold">🥈 2nd</Badge>
                      ) : row.batchRank === 3 ? (
                        <Badge variant="warning" className="!font-bold">🥉 3rd</Badge>
                      ) : (
                        <span className="font-semibold text-text-secondary">#{row.batchRank}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Footer Row: Class Averages */}
            <tfoot>
              <tr className="bg-slate-100 dark:bg-slate-800/90 font-bold border-t-2 border-border-light dark:border-border-dark text-text-main dark:text-white">
                <td className="py-3 px-3 text-center sticky left-0 z-20 bg-slate-100 dark:bg-slate-800 border-r border-border-light dark:border-border-dark">
                  -
                </td>
                <td className="py-3 px-4 sticky left-12 z-20 bg-slate-100 dark:bg-slate-800 border-r border-border-light dark:border-border-dark shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Class Average Score
                </td>

                {/* Per-Test Class Average */}
                {testColumns.map(test => (
                  <td key={test.id} className="py-3 px-4 text-center font-mono text-primary dark:text-primary-light border-r border-border-light dark:border-border-dark">
                    {displayMode === 'percentage'
                      ? `${((test.classAverageScore / test.totalMarks) * 100).toFixed(1)}%`
                      : test.classAverageScore}
                  </td>
                ))}

                <td colSpan={2} className="py-3 px-4 text-center sticky right-0 z-20 bg-slate-100 dark:bg-slate-800 border-l border-border-light dark:border-border-dark">
                  -
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card.Body>
    </Card>
  );
}
