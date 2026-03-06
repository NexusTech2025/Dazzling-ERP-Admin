import React from 'react';
import Card from '../../../components/ui/Card';
import { ScheduleHeader, ScheduleSlotCard, EmptySlot, ScheduleLegend } from './ScheduleComponents';

const WeeklyScheduleTable = ({ schedule = [] }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Helper to get max slots in any day to determine row count
  const maxSlots = Math.max(...schedule.map(d => d.slots.length), 1);
  const rows = Array.from({ length: maxSlots });

  return (
    <Card className="overflow-hidden border-2 border-primary/5">
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full border-collapse min-w-[1000px]">
          <ScheduleHeader days={days} />
          <tbody>
            {rows.map((_, rowIndex) => (
              <tr key={rowIndex} className="divide-x divide-border-light dark:divide-border-dark">
                {days.map(dayName => {
                  const dayData = schedule.find(d => d.day === dayName);
                  const slot = dayData?.slots[rowIndex];

                  return (
                    <td key={dayName} className="p-2 h-32 align-top transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      {slot ? (
                        <ScheduleSlotCard slot={slot} />
                      ) : (
                        <EmptySlot />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <ScheduleLegend />
    </Card>
  );
};

export default WeeklyScheduleTable;
