import React from 'react';
import { parseISO, format } from 'date-fns';
import Card from '../../../../../components/ui/Card';
import Badge from '../../../../../components/ui/Badge';

const ConfigHistoryTimelineCard = React.memo(({ sortedHistory = [], activeConfig, onEdit, onDelete }) => {
  const formatShortDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return format(parseISO(dateStr), 'MMM yyyy');
    } catch {
      return '';
    }
  };

  return (
    <Card className="h-full">
      <Card.Header border={true} className="flex items-center justify-between bg-slate-50/20 dark:bg-slate-800/20">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-text-secondary text-xl" aria-hidden="true">history</span>
          <h3 className="text-lg font-bold text-text-main dark:text-white">
            Config History
          </h3>
        </div>
      </Card.Header>

      <Card.Body className="p-6">
        {sortedHistory.length > 0 ? (
          <div className="relative pl-2">
            {sortedHistory.map((item, index) => {
              const isCurrent = item.salary_config_id === activeConfig?.salary_config_id;
              const val = item.base_value || item.base_amount || 0;

              const dateFrom = formatShortDate(item.effective_from);
              const dateTo = item.effective_to ? formatShortDate(item.effective_to) : 'Present';

              return (
                <div key={item.salary_config_id} className="relative pl-6 pb-6 last:pb-0 group">
                  {index < sortedHistory.length - 1 && (
                    <div className="absolute left-[5.5px] top-4 bottom-0 w-[1px] bg-slate-200 dark:bg-slate-800"></div>
                  )}
                  <div className={`absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-surface-light dark:border-surface-dark ${isCurrent ? 'bg-primary' : 'bg-slate-400 dark:bg-slate-700'}`}></div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">{dateFrom} - {dateTo}</span>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-text-main dark:text-white capitalize">
                        {(item.salary_config_type || 'recurring_monthly').replace('_', ' ')}
                      </span>
                      <span className="text-sm font-mono font-bold text-text-main dark:text-white">
                        ₹{val.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant={
                        item.contract_status === 'active' ? 'success' :
                          item.contract_status === 'drafted' ? 'default' :
                            item.contract_status === 'expired' ? 'warning' : 'danger'
                      } className="font-extrabold text-[8px] uppercase px-1.5 py-0.5 scale-90 origin-left">
                        {item.contract_status || 'drafted'}
                      </Badge>
                      <Badge variant={
                        item.settlement_state === 'settled' ? 'success' :
                          item.settlement_state === 'unsettled' ? 'warning' : 'danger'
                      } className="font-extrabold text-[8px] uppercase px-1.5 py-0.5 scale-90 origin-left">
                        {(item.settlement_state || 'unsettled').replace('_', ' ')}
                      </Badge>
                    </div>

                    {item.remark && (
                      <p className="text-xs text-text-secondary leading-relaxed font-medium mt-1">
                        {item.remark}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="text-[11px] font-bold text-primary hover:underline"
                        aria-label="Edit item in timeline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(item.salary_config_id)}
                        className="text-[11px] font-bold text-rose-500 hover:underline"
                        aria-label="Delete item from timeline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10">
            <span className="material-symbols-outlined text-text-secondary/20 text-4xl mb-2" aria-hidden="true">history</span>
            <p className="text-xs text-text-secondary">No contract history found.</p>
          </div>
        )}
      </Card.Body>

      <Card.Footer border={true} className="text-center py-3 bg-slate-50/5 dark:bg-slate-800/10">
        <button className="text-xs font-bold text-text-secondary hover:text-primary transition-colors">
          Archive Records
        </button>
      </Card.Footer>
    </Card>
  );
});

ConfigHistoryTimelineCard.displayName = 'ConfigHistoryTimelineCard';

export default ConfigHistoryTimelineCard;
