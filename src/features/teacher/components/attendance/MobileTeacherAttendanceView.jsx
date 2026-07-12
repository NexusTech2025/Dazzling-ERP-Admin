import React from 'react';
import MobileBaseLayout from '../../../../components/layout/MobileBaseLayout';
import { AttendanceStatsGrid } from './AttendanceStatsGrid';
import { AttendanceStatusButtons } from './AttendanceStatusButtons';
import { MobilePunchEditorDrawer } from '../../../../components/domain/MobilePunchEditorDrawer';
import { AttendanceActionFooter } from './AttendanceActionFooter';
import Button from '../../../../components/ui/v2/Button';
import TimePill from '../../../../components/ui/v2/TimePill';

export const MobileTeacherAttendanceView = ({
  filteredTeachers,
  isLoading,
  isEditingDisabled,
  actions,
  activeMobileEditingRowId,
  setActiveMobileEditingRowId,
  activeMobileEditingRow,
  metrics,
  filters,
  isDirty,
  saveStatus
}) => {
  return (
    <MobileBaseLayout>
      <MobileBaseLayout.Header
        title="Teacher Attendance"
        renderLeft={
          <button
            onClick={() => window.history.back()}
            className="size-9 rounded-full flex items-center justify-center text-text-main dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
        }
      />

      <MobileBaseLayout.RibbonSlot>
        <AttendanceStatsGrid metrics={metrics} isMobile={true} />
      </MobileBaseLayout.RibbonSlot>

      <MobileBaseLayout.FilterSlot>
        <div className="flex flex-col gap-3 w-full bg-white dark:bg-[#122131] p-3 rounded-xl border border-border-light dark:border-white/5 shadow-sm">
          {filters}
        </div>
      </MobileBaseLayout.FilterSlot>

      <MobileBaseLayout.ListSlot
        isEmpty={filteredTeachers.length === 0}
        renderEmptyState={
          <div className="py-10 text-center text-xs text-text-secondary w-full">
            {isLoading ? 'Loading mobile registry...' : 'No faculty records found.'}
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          {filteredTeachers.map((row) => (
            <div key={row.id} className="p-4 rounded-xl border border-border-light dark:border-white/5 bg-slate-50/50 dark:bg-[#0a1420] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-text-main dark:text-white">{row.full_name}</span>
                  <span className="text-[9px] text-text-secondary mt-0.5">Batch: {row.batch_name}</span>
                </div>
                <AttendanceStatusButtons
                  row={row}
                  isEditingDisabled={isEditingDisabled}
                  onStatusChange={actions.handleStatusChange}
                  isMobile={true}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-text-secondary pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <TimePill
                    label="In"
                    value={row.entry_time}
                    variant="success"
                  />
                  <TimePill
                    label="Out"
                    value={row.exit_time}
                    variant="info"
                  />
                </div>
                <Button variant="text" size="sm" startIcon="edit" onClick={() => setActiveMobileEditingRowId(row.id)}>
                  Configure times
                </Button>
              </div>
            </div>
          ))}
        </div>
      </MobileBaseLayout.ListSlot>

      {/* Sticky Bottom Actions Bar Slot */}
      {isDirty && (
        <MobileBaseLayout.ActionBarSlot>
          <AttendanceActionFooter
            isDirty={isDirty}
            isSaving={saveStatus === 'saving'}
            onReset={actions.handleReset}
            onSave={actions.handleSave}
          />
        </MobileBaseLayout.ActionBarSlot>
      )}

      {/* Decoupled Popover Portal to avoid input re-render jank */}
      {activeMobileEditingRow && (
        <MobilePunchEditorDrawer
          row={activeMobileEditingRow}
          isEditingDisabled={isEditingDisabled}
          onTimeChange={actions.handleTimeChange}
          onRemarksChange={actions.handleRemarksChange}
          onClose={() => setActiveMobileEditingRowId(null)}
        />
      )}
    </MobileBaseLayout>
  );
};

export default MobileTeacherAttendanceView;
