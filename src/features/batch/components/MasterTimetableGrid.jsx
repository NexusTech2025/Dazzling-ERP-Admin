import React from 'react';
import Card from '../../../components/ui/Card';
import { TimeHeader, ScheduleSlotCard, EmptySlot, ScheduleLegend } from './ScheduleComponents';

const MasterTimetableGrid = ({ timeSlots = [], matrix = [] }) => {
  return (
    <Card className="overflow-hidden border-2 border-primary/5">
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full border-collapse">
          <TimeHeader timeSlots={timeSlots} />
          <tbody>
            {matrix.map(row => (
              <tr key={row.batch_id} className="divide-x divide-border-light dark:divide-border-dark border-b border-border-light dark:border-border-dark">
                {/* Sticky Batch Name Column */}
                <td className="p-4 bg-white dark:bg-slate-900 sticky left-0 z-10 border-r border-border-light dark:border-border-dark shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-text-main dark:text-white uppercase tracking-tight">{row.batch_name}</span>
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest mt-0.5 opacity-70">{row.batch_id}</span>
                  </div>
                </td>

                {/* Time Slot Columns */}
                {row.slots.map((slot, idx) => (
                  <td key={idx} className="p-2 min-w-[200px] h-32 align-top transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    {slot ? (
                      <ScheduleSlotCard slot={slot} />
                    ) : (
                      <EmptySlot />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <ScheduleLegend />
    </Card>
  );
};

export default MasterTimetableGrid;
