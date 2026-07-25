import React, { useState, useMemo } from 'react';
import Card from '../../../../../components/ui/Card';
import Badge from '../../../../../components/ui/Badge';
import Button from '../../../../../components/ui/v2/Button';
import ProgressBar from '../../../../../components/ui/v2/ProgressBar';
import InstallmentStepperTimeline from './InstallmentStepperTimeline';
import InstallmentDetailPanel from './InstallmentDetailPanel';

/**
 * Self-contained financial account card for a single student enrollment.
 *
 * @param {object} props - Component properties.
 * @param {object} props.enrollment - Hydrated enrollment entity.
 * @param {boolean} [props.defaultExpanded=true] - Initial open/closed state.
 * @returns {JSX.Element} Enrollment fee account card.
 */
export const FeeAccountCard = ({ enrollment, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const feeAccount = enrollment?.studentfeeaccounts?.[0];
  const feePlan = feeAccount?.feeplan || enrollment?.feeplan;
  const installments = useMemo(() => feeAccount?.installments || [], [feeAccount]);

  const itemName = enrollment?.item_name || enrollment?.package_name || enrollment?.course_name || 'Academic Program';
  const itemType = enrollment?.item_type || (enrollment?.item_id?.startsWith('PKG') ? 'Package' : 'Course');
  const enrollmentId = enrollment?.enrollment_id || enrollment?.id || 'N/A';
  const enrollmentStatus = (enrollment?.status || 'active').toLowerCase();

  // Selected Installment State
  const defaultSelectedId = useMemo(() => {
    if (!installments || installments.length === 0) return null;
    const unpaid = installments.find(i => (i.status || '').toLowerCase() !== 'paid');
    return unpaid ? (unpaid.installment_id || unpaid.id) : (installments[0]?.installment_id || installments[0]?.id);
  }, [installments]);

  const [selectedInstallmentId, setSelectedInstallmentId] = useState(defaultSelectedId);

  // Sync selected installment if default changes
  React.useEffect(() => {
    if (defaultSelectedId && !selectedInstallmentId) {
      setSelectedInstallmentId(defaultSelectedId);
    }
  }, [defaultSelectedId, selectedInstallmentId]);

  // Aggregate Computations
  const totalFee = Number(feeAccount?.final_fee ?? feeAccount?.total_fee ?? 0);
  const discountAmount = Number(feeAccount?.discount_amount ?? 0);
  const paidAmount = Number(feeAccount?.amount_paid ?? 0);
  const balanceDue = Number(feeAccount?.balance_due ?? Math.max(0, totalFee - paidAmount));
  const lateFee = Number(feeAccount?.late_fee ?? 0);

  const progressPercent = totalFee > 0 ? Math.min(100, Math.round((paidAmount / totalFee) * 100)) : 0;
  const paidCount = installments.filter(i => (i.status || '').toLowerCase() === 'paid').length;
  const overdueCount = installments.filter(i => (i.status || '').toLowerCase() === 'overdue').length;

  const selectedInstallmentObj = useMemo(() => {
    if (!installments || installments.length === 0) return null;
    return installments.find(i => (i.installment_id || i.id) === selectedInstallmentId) || installments[0];
  }, [installments, selectedInstallmentId]);

  const selectedIndex = useMemo(() => {
    if (!installments || !selectedInstallmentObj) return 0;
    return installments.findIndex(i => (i.installment_id || i.id) === (selectedInstallmentObj.installment_id || selectedInstallmentObj.id));
  }, [installments, selectedInstallmentObj]);

  const formatDate = (dateVal) => {
    if (!dateVal) return 'N/A';
    try {
      return new Date(dateVal).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return String(dateVal);
    }
  };

  return (
    <Card className="overflow-hidden shadow-sm transition-all duration-300">
      {/* Account Card Header */}
      <div className="p-5 border-b border-border-light dark:border-border-dark bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">
              {itemType.toLowerCase() === 'package' ? 'inventory_2' : 'menu_book'}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-text-main dark:text-white text-base truncate">
                {itemName}
              </h3>
              <Badge variant={itemType.toLowerCase() === 'package' ? 'primary' : 'info'} className="text-[10px]">
                {itemType}
              </Badge>
            </div>
            <p className="text-xs text-text-secondary mt-0.5 font-mono truncate">
              Enrollment ID: <span className="font-semibold text-slate-700 dark:text-slate-300">{enrollmentId}</span>
              {' • '}
              Fee Plan: <span className="font-semibold text-slate-700 dark:text-slate-300">{feePlan?.name || feePlan?.plan_name || 'Standard Plan'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Badge variant={enrollmentStatus === 'active' ? 'success' : 'neutral'}>
            {enrollmentStatus.toUpperCase()}
          </Badge>
          <span className="text-xs font-bold text-slate-500 hidden sm:inline">
            {installments.length} Installments
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="size-8 rounded-xl bg-slate-200/60 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all"
            title={isExpanded ? 'Collapse Fee Account' : 'Expand Fee Account'}
          >
            <span className="material-symbols-outlined text-lg">
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>
      </div>

      {/* Expanded Content Body */}
      {isExpanded && (
        <Card.Body className="p-6 space-y-6">
          {!feeAccount || installments.length === 0 ? (
            /* Empty Fee Schedule Card */
            <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-center space-y-3">
              <span className="material-symbols-outlined text-4xl text-slate-400">payments</span>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Fee Schedule Configured</h4>
                <p className="text-xs text-slate-500 mt-1">This enrollment does not have an active fee plan or installment schedule attached.</p>
              </div>
              <Button
                variant="outlined"
                size="sm"
                startIcon="add"
                onClick={() => alert('Configure Fee Plan wizard...')}
                className="mt-2"
              >
                Configure Fee Plan
              </Button>
            </div>
          ) : (
            <>
              {/* Row 1: 5 Mini KPI Metric Summary Tiles */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lg">payments</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Fee</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">₹{totalFee.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lg">sell</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Discount / Adj.</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">₹{discountAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Paid Amount</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">₹{paidAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lg">pending_actions</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Balance Due</span>
                    <span className="text-sm font-black text-amber-600 dark:text-amber-400">₹{balanceDue.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center gap-3 col-span-2 md:col-span-1">
                  <div className="size-9 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lg">schedule</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Late Fee</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">₹{lateFee.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Row 2: Payment Progress & Account Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">Payment Progress</span>
                    <span className="text-emerald-600 font-extrabold">{progressPercent}%</span>
                  </div>
                  <ProgressBar value={progressPercent} color="emerald" size="md" />
                  <p className="text-[11px] text-slate-500 font-medium pt-1">
                    {paidCount} of {installments.length} installments paid
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Account Status</span>
                    <Badge variant={overdueCount > 0 ? 'danger' : 'success'}>
                      {overdueCount > 0 ? 'Overdue Action Required' : 'Good Standing'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium text-right">
                    {overdueCount > 0 ? `${overdueCount} overdue installment(s)` : 'No overdue installments'}
                  </p>
                </div>
              </div>

              {/* Row 3: Horizontal Installment Stepper Timeline */}
              <div className="pt-2">
                <InstallmentStepperTimeline
                  installments={installments}
                  selectedInstallmentId={selectedInstallmentId}
                  onSelectInstallment={setSelectedInstallmentId}
                />
              </div>

              {/* Row 4: Split Two-Column Master-Detail Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                {/* Left Column: Installments Schedule Table */}
                <div className="lg:col-span-7 xl:col-span-8 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100/70 dark:bg-slate-800/70 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3.5 text-center">#</th>
                        <th className="p-3.5">Due Date</th>
                        <th className="p-3.5 text-right">Due Amount</th>
                        <th className="p-3.5 text-right">Paid</th>
                        <th className="p-3.5 text-right">Late Fee</th>
                        <th className="p-3.5 text-center">Status</th>
                        <th className="p-3.5 text-center">Payments</th>
                        <th className="p-3.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {installments.map((inst, idx) => {
                        const instId = inst.installment_id || inst.id || `inst-${idx}`;
                        const isSelected = selectedInstallmentId === instId;
                        const statusStr = (inst.status || 'pending').toLowerCase();
                        const dueAmountInst = Number(inst.amount || inst.due_amount || 0);
                        const paidAmountInst = Number(inst.paid_amount || 0);
                        const lateFeeInst = Number(inst.late_fee || 0);
                        const pmtCount = inst.payments?.length || (inst.payment_records?.length || (statusStr === 'paid' ? 1 : 0));

                        let statusBadgeVariant = 'warning';
                        if (statusStr === 'paid') statusBadgeVariant = 'success';
                        else if (statusStr === 'upcoming') statusBadgeVariant = 'info';
                        else if (statusStr === 'overdue') statusBadgeVariant = 'danger';

                        return (
                          <tr
                            key={instId}
                            onClick={() => setSelectedInstallmentId(instId)}
                            className={`cursor-pointer transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/40 ${
                              isSelected ? 'bg-primary/5 dark:bg-primary/10 font-medium' : ''
                            }`}
                          >
                            <td className="p-3.5 text-center font-bold text-slate-700 dark:text-slate-300">
                              {idx + 1}
                            </td>
                            <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                              {formatDate(inst.due_date)}
                            </td>
                            <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white">
                              ₹{dueAmountInst.toLocaleString()}
                            </td>
                            <td className="p-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                              ₹{paidAmountInst.toLocaleString()}
                            </td>
                            <td className="p-3.5 text-right text-slate-500">
                              ₹{lateFeeInst.toLocaleString()}
                            </td>
                            <td className="p-3.5 text-center">
                              <Badge variant={statusBadgeVariant} className="text-[10px]">
                                {statusStr.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="p-3.5 text-center text-slate-500">
                              {pmtCount > 0 ? (
                                <span className="inline-flex items-center gap-1 text-primary font-bold">
                                  <span className="material-symbols-outlined text-sm">receipt</span>
                                  {pmtCount} Payment{pmtCount > 1 ? 's' : ''}
                                </span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                              {statusStr === 'paid' ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedInstallmentId(instId)}
                                  className="text-xs font-bold text-primary hover:underline"
                                >
                                  View Receipts &gt;
                                </button>
                              ) : (
                                <Button
                                  variant="outlined"
                                  size="sm"
                                  onClick={() => alert(`Record payment for Installment #${idx + 1}`)}
                                  className="text-[11px] py-1 px-2.5 rounded-lg"
                                >
                                  Record Payment
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Right Column: Selected Installment Details Panel */}
                <div className="lg:col-span-5 xl:col-span-4">
                  <InstallmentDetailPanel
                    installment={selectedInstallmentObj}
                    installmentIndex={selectedIndex + 1}
                  />
                </div>
              </div>
            </>
          )}
        </Card.Body>
      )}
    </Card>
  );
};

export default FeeAccountCard;
