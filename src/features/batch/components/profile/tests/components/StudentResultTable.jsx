import React, { useState } from 'react';
import TextInput from '../../../../../../components/ui/v2/TextInput';
import Badge from '../../../../../../components/ui/Badge';

export default function StudentResultTable({
  results = [],
  studentsMap = {},
  totalMarks = 100
}) {
  const [query, setQuery] = useState('');

  const getGradeVariant = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A': return 'success';
      case 'B':
      case 'C': return 'info';
      case 'D': return 'warning';
      case 'F': default: return 'danger';
    }
  };

  const filteredResults = results.filter(r => {
    const studentName = studentsMap[r.student_id]?.student_name || r.student_name || '';
    return studentName.toLowerCase().includes(query.toLowerCase()) || (r.student_id || '').toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden p-4 space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <h4 className="text-base font-bold text-text-main dark:text-white">
          Class Performance Breakdown
        </h4>
        <div className="w-full sm:w-72">
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search student in report..."
            startIcon="search"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark bg-surface-light/80 dark:bg-surface-dark/80 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3">Marks Obtained</th>
              <th className="px-4 py-3">Percentage</th>
              <th className="px-4 py-3">Grade</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-text-secondary">
                  No records match your query.
                </td>
              </tr>
            ) : (
              filteredResults.map((row) => {
                const studentName = studentsMap[row.student_id]?.student_name || row.student_name || row.student_id;
                return (
                  <tr
                    key={row.student_id}
                    className="border-b border-border-light dark:border-border-dark hover:bg-surface-light/50 dark:hover:bg-surface-dark/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs font-bold text-text-secondary">
                      {row.is_absent ? '-' : `#${row.rank}`}
                    </td>

                    <td className="px-4 py-3 text-sm font-semibold text-text-main dark:text-white">
                      {studentName}
                    </td>

                    <td className="px-4 py-3 text-sm font-bold text-text-main dark:text-white">
                      {row.is_absent ? (
                        <span className="text-red-500 font-medium">0 / {totalMarks}</span>
                      ) : (
                        <span>{row.obtained} / {totalMarks}</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium text-text-secondary">
                      {row.is_absent ? '0%' : `${row.percentage}%`}
                    </td>

                    <td className="px-4 py-3">
                      <Badge variant={getGradeVariant(row.grade)}>
                        {row.grade}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 text-center">
                      {row.is_absent ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-500">
                          Absent
                        </span>
                      ) : row.isPass ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-500">
                          Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-500">
                          Failed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
