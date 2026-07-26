import React, { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import Badge from '../../../components/ui/Badge';

/**
 * Format raw monetary numbers into readable short currency format (e.g. 110000 -> ₹110K, 82500 -> ₹82.5K)
 */
const formatShortCurrency = (val) => {
  const num = Number(val) || 0;
  if (num === 0) return '₹0';
  if (num >= 100000) {
    const inLakhs = num / 100000;
    return `₹${inLakhs % 1 === 0 ? inLakhs.toFixed(0) : inLakhs.toFixed(1)}L`;
  }
  if (num >= 1000) {
    const inK = num / 1000;
    return `₹${inK % 1 === 0 ? inK.toFixed(0) : inK.toFixed(1)}K`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
};

/**
 * Helper to safely format date strings using date-fns
 */
const formatDateShort = (dateStr) => {
  if (!dateStr) return null;
  try {
    const parsed = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(parsed, 'dd MMM');
  } catch (e) {
    return null;
  }
};

/**
 * PackageEnrollmentCard Component
 * Renders real student package enrollment details, fee balances, installment timeline,
 * last payment info, and next due date derived strictly from hydrated backend payloads.
 */
export const PackageEnrollmentCard = ({ enrollment }) => {
  if (!enrollment) return null;

  const student = enrollment.student;
  const studentName = student?.full_name || student?.student_name || enrollment.student_id || 'Unknown Student';
  const studentId = enrollment.student_id || student?.student_id || '';
  const status = enrollment.status || 'active';

  // Extract financial account details strictly from studentfeeaccounts array
  const feeAccount = enrollment.studentfeeaccounts?.[0] || null;
  const totalFee = feeAccount ? (feeAccount.final_fee ?? feeAccount.total_fee ?? 0) : 0;
  const amountPaid = feeAccount ? (feeAccount.amount_paid ?? 0) : 0;
  const balanceDue = feeAccount ? (feeAccount.balance_due ?? Math.max(0, totalFee - amountPaid)) : 0;
  const paidPercent = totalFee > 0 ? Math.min(100, Math.round((amountPaid / totalFee) * 100)) : 0;

  // Extract real installments from feeAccount payload
  const installments = useMemo(() => {
    if (Array.isArray(feeAccount?.installments) && feeAccount.installments.length > 0) {
      return [...feeAccount.installments].sort((a, b) => (a.installment_number || 0) - (b.installment_number || 0));
    }
    return [];
  }, [feeAccount?.installments]);

  // Compute Last Payment & Next Due Installment from real records
  const { lastPaymentInfo, nextDueInfo } = useMemo(() => {
    let lastPay = null;
    let nextDue = null;

    for (const inst of installments) {
      const isPaid = (inst.status || '').toLowerCase() === 'paid' || (inst.paid_amount || 0) > 0 || (inst.payments && inst.payments.length > 0);
      
      if (isPaid) {
        const payDate = inst.payments?.[0]?.payment_date || inst.due_date;
        const payAmount = inst.payments?.[0]?.amount_paid || inst.paid_amount || inst.due_amount || 0;
        lastPay = {
          dateStr: formatDateShort(payDate) || 'Paid',
          amountStr: formatShortCurrency(payAmount)
        };
      } else if (!nextDue && ((inst.status || '').toLowerCase() === 'pending' || (inst.status || '').toLowerCase() === 'overdue')) {
        nextDue = {
          dateStr: formatDateShort(inst.due_date) || 'Upcoming',
          amountStr: formatShortCurrency(inst.due_amount || 0)
        };
      }
    }

    return {
      lastPaymentInfo: lastPay,
      nextDueInfo: nextDue
    };
  }, [installments]);

  const initials = studentName
    ? studentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
      
      {/* 1. Header Section: Avatar, Student Info, Status Badge & Menu */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="size-12 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm shrink-0 border border-blue-500/15 select-none">
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white text-base md:text-lg truncate tracking-tight">
              {studentName}
            </h3>
            {studentId && (
              <p className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 tracking-wide mt-0.5">
                {studentId}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={status.toLowerCase() === 'active' ? 'success' : status.toLowerCase() === 'completed' ? 'info' : 'warning'}>
            <span className="flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${status.toLowerCase() === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span className="capitalize">{status}</span>
            </span>
          </Badge>

          <button 
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="More Options"
          >
            <span className="material-symbols-outlined text-xl">more_vert</span>
          </button>
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800/80 my-4"></div>

      {/* 2. Fee Summary Section: Total Fee, Progress Bar, Balance Due */}
      <div className="grid grid-cols-12 items-center gap-4">
        <div className="col-span-4 md:col-span-3">
          <p className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatShortCurrency(totalFee)}
          </p>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
            Total Fee
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="col-span-4 md:col-span-6 flex items-center gap-3 px-2">
          <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${paidPercent}%` }}
            ></div>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
            {paidPercent}%
          </span>
        </div>

        <div className="col-span-4 md:col-span-3 text-right">
          <p className="text-xl md:text-2xl font-extrabold text-amber-500 dark:text-amber-400 tracking-tight">
            {formatShortCurrency(balanceDue)}
          </p>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
            Due
          </p>
        </div>
      </div>

      {/* 3. Installments Timeline Stepper (Rendered if real installments exist) */}
      {installments.length > 0 && (
        <>
          <div className="border-t border-slate-100 dark:border-slate-800/80 my-5"></div>
          <div className="relative px-4 py-1">
            {/* Dashed Timeline Connector Line */}
            <div className="absolute top-4 left-8 right-8 h-[2px] border-t-2 border-dashed border-slate-200 dark:border-slate-800 z-0"></div>

            <div className="relative z-10 flex items-center justify-between">
              {installments.map((inst, idx) => {
                const isPaid = (inst.status || '').toLowerCase() === 'paid' || (inst.paid_amount || 0) >= (inst.due_amount || 1);
                return (
                  <div key={inst.installment_id || idx} className="flex flex-col items-center gap-1.5">
                    <div 
                      className={`size-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isPaid
                          ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 ring-4 ring-white dark:ring-slate-900'
                          : 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 ring-4 ring-white dark:ring-slate-900'
                      }`}
                    >
                      {isPaid ? (
                        <span className="material-symbols-outlined text-base font-bold">check</span>
                      ) : (
                        <span className="text-xs font-bold">{inst.installment_number || idx + 1}</span>
                      )}
                    </div>
                    <span className={`text-xs font-bold ${isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      {inst.installment_number || idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="border-t border-slate-100 dark:border-slate-800/80 my-5"></div>

      {/* 4. Footer Section: Last Payment & Next Due Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        {/* Last Payment Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
          <div className="size-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-lg">credit_card</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              Last Payment:
            </p>
            {lastPaymentInfo ? (
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                {lastPaymentInfo.dateStr} <span className="text-slate-300 dark:text-slate-600 mx-1">•</span> <span className="font-extrabold text-slate-900 dark:text-white">{lastPaymentInfo.amountStr}</span>
              </p>
            ) : (
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate mt-0.5">
                No Payments Yet
              </p>
            )}
          </div>
        </div>

        {/* Next Due Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
          <div className="size-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-lg">calendar_month</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              Next:
            </p>
            {nextDueInfo ? (
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                {nextDueInfo.dateStr} <span className="text-slate-300 dark:text-slate-600 mx-1">•</span> <span className="font-extrabold text-amber-600 dark:text-amber-400">{nextDueInfo.amountStr}</span>
              </p>
            ) : (
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate mt-0.5">
                Fully Paid
              </p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default PackageEnrollmentCard;
