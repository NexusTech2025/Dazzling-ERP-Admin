/**
 * Centralized Alert Message Registry Map.
 * Provides key-indexed message formatting functions for drawer alerts.
 */
export const ALERT_MESSAGE_REGISTRY = {
  // Target Selection Keys
  TARGET_NO_SELECTION: (targetType) => ({
    variant: 'warning',
    icon: 'warning',
    title: `No Target ${targetType === 'package' ? 'Package' : 'Course'} Selected`,
    message: `Click 'Browse ${targetType === 'package' ? 'Package' : 'Course'} Catalog' or the selection card below to choose a target ${targetType} from the directory.`
  }),
  TARGET_PACKAGE_SELECTED: (pkg) => ({
    variant: 'info',
    icon: 'inventory_2',
    title: 'Package Target Selected',
    message: `Selected Package '${pkg.name || pkg.package_name}' (${pkg.package_id || pkg.id}). Configure batch seating assignments below.`
  }),
  TARGET_COURSE_SELECTED: (crs) => ({
    variant: 'info',
    icon: 'school',
    title: 'Course Target Selected',
    message: `Selected standalone Course '${crs.name || crs.course_name}' (${crs.course_id || crs.id}). Configure batch seating assignment below.`
  }),

  // Payment Rollover Keys
  PAYMENT_FULL_CREDIT: (oldPaid) => ({
    variant: 'success',
    icon: 'check_circle',
    title: 'Full Payment Credit — Contract Fully Settled',
    message: `Previous payment credit of ₹${oldPaid.toLocaleString()} covers the new fee in full. New balance due is ₹0.`
  }),
  PAYMENT_PARTIAL_CREDIT: (oldPaid, balanceDue) => ({
    variant: 'info',
    icon: 'account_balance_wallet',
    title: 'Payment Credit Applied',
    message: `Previous payment credit of ₹${oldPaid.toLocaleString()} will be applied. Outstanding balance to be collected is ₹${balanceDue.toLocaleString()}.`
  }),
  PAYMENT_NO_ROLLOVER: (oldPaid, newFee) => ({
    variant: 'warning',
    icon: 'money_off',
    title: 'No Payment Rollover',
    message: `Previous payment of ₹${oldPaid.toLocaleString()} will NOT be credited. Full new fee of ₹${newFee.toLocaleString()} will be charged.`
  }),

  // Batch Seating Keys
  SEATING_ALL_ASSIGNED: (count) => ({
    variant: 'success',
    icon: 'groups',
    title: 'Seating Slots Allocated',
    message: `All ${count} course seating slot(s) have active batches assigned.`
  }),
  SEATING_UNASSIGNED_PRESENT: (unassignedCount) => ({
    variant: 'warning',
    icon: 'event_seat',
    title: 'Unassigned Batch Seating',
    message: `${unassignedCount} course(s) are missing batch assignments. Unassigned courses will be marked as unallocated.`
  }),

  // Sidebar Summary Key
  MIGRATION_SUMMARY_NOTICE: (oldEnrId, creditApplied) => ({
    variant: 'warning',
    icon: 'gavel',
    title: 'Contract Finality Notice',
    message: `Old contract ${oldEnrId} will be marked 'Withdrawn' and ₹${creditApplied.toLocaleString()} credit will be transferred. This operation cannot be undone.`
  }),

  // Discard Settlement Keys
  DISCARD_REFUND_SETTLEMENT: (paidAmount, allocationsCount) => ({
    variant: 'info',
    icon: 'payments',
    title: 'Refund Settlement',
    message: `A refund of ₹${paidAmount.toLocaleString()} will be issued. All ${allocationsCount} batch seating slot(s) and unpaid installments will be cancelled.`
  }),
  DISCARD_NO_REFUND_SETTLEMENT: (balanceDue) => ({
    variant: 'warning',
    icon: 'money_off',
    title: 'Non-Refundable Account Closure',
    message: `No refund will be issued. Unpaid balance of ₹${balanceDue.toLocaleString()} will be waived off and contract closed.`
  })
};

/**
 * Base Alert Strategy Interface (Strategy Pattern).
 */
export class BaseAlertStrategy {
  evaluate(context) {
    throw new Error('BaseAlertStrategy.evaluate must be implemented.');
  }
}

/**
 * Strategy for Target Selection Alert.
 */
export class TargetSelectionAlertStrategy extends BaseAlertStrategy {
  evaluate({ targetType, selectedTargetEntity }) {
    if (!selectedTargetEntity) {
      return ALERT_MESSAGE_REGISTRY.TARGET_NO_SELECTION(targetType);
    }
    if (targetType === 'package') {
      return ALERT_MESSAGE_REGISTRY.TARGET_PACKAGE_SELECTED(selectedTargetEntity);
    }
    return ALERT_MESSAGE_REGISTRY.TARGET_COURSE_SELECTED(selectedTargetEntity);
  }
}

/**
 * Strategy for Payment Rollover Alert.
 */
export class PaymentRolloverAlertStrategy extends BaseAlertStrategy {
  evaluate({ rolloverPayments, oldPaidAmount, newFee, newBalanceDue }) {
    if (!rolloverPayments) {
      return ALERT_MESSAGE_REGISTRY.PAYMENT_NO_ROLLOVER(oldPaidAmount, newFee);
    }
    if (newBalanceDue === 0 && oldPaidAmount > 0) {
      return ALERT_MESSAGE_REGISTRY.PAYMENT_FULL_CREDIT(oldPaidAmount);
    }
    return ALERT_MESSAGE_REGISTRY.PAYMENT_PARTIAL_CREDIT(oldPaidAmount, newBalanceDue);
  }
}

/**
 * Strategy for Batch Seating Alert.
 */
export class BatchSeatingAlertStrategy extends BaseAlertStrategy {
  evaluate({ batchAssignments = [] }) {
    if (batchAssignments.length === 0) return null;
    const unassignedCount = batchAssignments.filter(ba => !ba.batch_id).length;
    if (unassignedCount === 0) {
      return ALERT_MESSAGE_REGISTRY.SEATING_ALL_ASSIGNED(batchAssignments.length);
    }
    return ALERT_MESSAGE_REGISTRY.SEATING_UNASSIGNED_PRESENT(unassignedCount);
  }
}

import { SETTLEMENT_POLICY_CONFIG } from '../config/withdrawalSettlementConfig.js';

/**
 * Strategy for Discard Settlement Alert.
 */
export class DiscardSettlementAlertStrategy extends BaseAlertStrategy {
  evaluate({ discardMode, paidAmount, balanceDue, allocationsCount = 0 }) {
    if (discardMode === 'refund') {
      return ALERT_MESSAGE_REGISTRY.DISCARD_REFUND_SETTLEMENT(paidAmount, allocationsCount);
    }
    return ALERT_MESSAGE_REGISTRY.DISCARD_NO_REFUND_SETTLEMENT(balanceDue);
  }
}

/**
 * Strategy for Withdrawal Financial Settlement Impact Alert.
 * Delegates computation dynamically to the declarative SETTLEMENT_POLICY_CONFIG registry.
 */
export class WithdrawalSettlementAlertStrategy extends BaseAlertStrategy {
  evaluate(context = {}) {
    const policyKey = context.policy || 'waive_unpaid';
    const config = SETTLEMENT_POLICY_CONFIG[policyKey];
    if (!config || typeof config.computeImpact !== 'function') {
      return null;
    }
    const impact = config.computeImpact(context);
    return {
      variant: config.alertVariant || 'info',
      ...impact
    };
  }
}

/**
 * Migration Business Rules Policy (Policy Pattern).
 */
export class MigrationPolicy {
  /**
   * Validates if a migration request satisfies business constraints.
   * 
   * @param {object} context - { targetId, parsedNewFee, batchAssignments }
   * @returns {{ isValid: boolean, violationReason?: string }}
   */
  static validate(context) {
    if (!context.targetId) {
      return { isValid: false, violationReason: 'Please select a target Package or Course for migration.' };
    }
    if (!context.parsedNewFee || context.parsedNewFee <= 0) {
      return { isValid: false, violationReason: 'Please specify a valid new contract total fee greater than ₹0.' };
    }
    return { isValid: true };
  }
}

/**
 * Discard Business Rules Policy (Policy Pattern).
 */
export class DiscardPolicy {
  /**
   * Validates if a discard request satisfies business constraints.
   * 
   * @param {object} context - { reason }
   * @returns {{ isValid: boolean, violationReason?: string }}
   */
  static validate(context) {
    if (!context.reason || !context.reason.trim()) {
      return { isValid: false, violationReason: 'Please provide a valid reason for discarding this enrollment contract.' };
    }
    return { isValid: true };
  }
}
