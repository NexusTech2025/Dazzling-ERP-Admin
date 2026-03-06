import React from 'react';
import Card from '../../../components/ui/Card';

const InstallmentScheduler = ({ installments, onChange, onAdd, onDelete, onGenerate, config }) => {
  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <Card variant="background" className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-bold text-text-main dark:text-white" htmlFor="installments-count">
              Number of Installments
            </label>
            <input 
              className="w-full rounded-xl border border-border-light bg-background-light px-4 py-2.5 text-sm font-bold text-text-main focus:border-primary focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-white" 
              id="installments-count" 
              type="number" 
              value={config.count}
              onChange={(e) => config.setCount(Number(e.target.value))}
            />
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-bold text-text-main dark:text-white" htmlFor="frequency">
              Payment Frequency
            </label>
            <div className="relative">
              <select 
                className="w-full appearance-none rounded-xl border border-border-light bg-background-light px-4 py-2.5 text-sm font-bold text-text-main focus:border-primary focus:ring-1 focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-white" 
                id="frequency"
                value={config.frequency}
                onChange={(e) => config.setFrequency(e.target.value)}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="biannually">Bi-Annually</option>
                <option value="annually">Annually</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-secondary">
                <span className="material-symbols-outlined text-[20px]">expand_more</span>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <button 
              onClick={onGenerate}
              className="flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition hover:bg-slate-800 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 dark:bg-primary dark:hover:bg-blue-600 md:w-auto shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              Generate Schedule
            </button>
          </div>
        </div>
      </Card>

      {/* Editable Table */}
      <Card className="overflow-hidden">
        <Card.Header className="flex items-center justify-between border-b border-border-light dark:border-border-dark px-6 py-4">
          <h3 className="text-lg font-bold text-text-main dark:text-white tracking-tight">Edit Installments</h3>
          <button 
            onClick={onAdd}
            className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Installment
          </button>
        </Card.Header>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-text-secondary dark:bg-slate-800/50 dark:text-text-secondary font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4 w-12 text-center">#</th>
                <th className="px-6 py-4">Label</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {installments.map((inst, idx) => (
                <tr key={inst.id || idx} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 text-center font-bold text-text-secondary">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <input 
                      className="w-full rounded-lg border border-transparent bg-transparent px-3 py-1.5 font-bold text-text-main hover:border-border-light focus:border-primary focus:bg-white dark:text-white dark:hover:border-border-dark dark:focus:bg-slate-800 outline-none transition-all" 
                      type="text" 
                      value={inst.name}
                      onChange={(e) => onChange(idx, 'name', e.target.value)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative group/input">
                      <input 
                        className="w-full rounded-lg border border-transparent bg-transparent pl-3 pr-10 py-1.5 font-medium text-text-main hover:border-border-light focus:border-primary focus:bg-white dark:text-white dark:hover:border-border-dark dark:focus:bg-slate-800 outline-none transition-all" 
                        type="date" 
                        value={inst.due_date}
                        onChange={(e) => onChange(idx, 'due_date', e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative flex items-center justify-end group/input">
                      <span className="absolute left-3 text-text-secondary text-xs font-bold">$</span>
                      <input 
                        className="w-32 rounded-lg border border-transparent bg-transparent pl-8 pr-3 py-1.5 text-right font-black text-text-main hover:border-border-light focus:border-primary focus:bg-white dark:text-white dark:hover:border-border-dark dark:focus:bg-slate-800 outline-none transition-all" 
                        type="number" 
                        value={inst.amount}
                        onChange={(e) => onChange(idx, 'amount', Number(e.target.value))}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onDelete(idx)}
                      className="text-text-secondary hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50/50 dark:bg-slate-800/30 border-t border-border-light dark:border-border-dark">
              <tr>
                <td className="px-6 py-4 text-right font-bold text-text-secondary" colspan="3">Total Scheduled Amount</td>
                <td className="px-6 py-4 text-right font-black text-primary text-lg">
                  ${installments.reduce((sum, inst) => sum + Number(inst.amount || 0), 0).toLocaleString()}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default InstallmentScheduler;
