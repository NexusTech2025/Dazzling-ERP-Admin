import React from 'react';
import Modal from './Modal';
import Button from './v2/Button';

/**
 * Domain-specific ResponseModal wrapper composing on top of abstract Modal.
 * Displays formatted 2-column key-value success metrics cards and error alerts.
 *
 * @param {Object} props - Component properties.
 * @param {boolean} props.isOpen - Visibility flag.
 * @param {Function} props.onClose - Dismissal callback.
 * @param {('success'|'error'|'info'|'warning')} [props.variant='success'] - Visual status variant.
 * @param {string} props.title - Dialog title.
 * @param {string} [props.subtitle] - Dialog subtitle.
 * @param {Array<Object>} [props.items] - Formatted key-value metrics items for SuccessCard.
 * @param {Object} [props.errorObj] - Error details payload ({ code, message, details }) for ErrorCard.
 * @param {Function} [props.onRetry] - Optional retry handler callback for error state.
 * @returns {React.JSX.Element|null} Rendered response modal.
 */
export function ResponseModal({
  isOpen,
  onClose,
  variant = 'success',
  title,
  subtitle,
  items = [],
  errorObj = null,
  onRetry = null
}) {
  const isSuccess = variant === 'success';
  const isError = variant === 'error';

  const iconName = isSuccess ? 'check_circle' : isError ? 'error' : 'info';
  const iconColor = isSuccess ? 'text-emerald-600 dark:text-emerald-400' : isError ? 'text-rose-600 dark:text-rose-400' : 'text-primary';
  const iconBg = isSuccess ? 'bg-emerald-100 dark:bg-emerald-950/50' : isError ? 'bg-rose-100 dark:bg-rose-950/50' : 'bg-primary/10';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <Modal.Header
        title={title || (isSuccess ? 'Success' : 'Error')}
        subtitle={subtitle}
        icon={iconName}
        iconColor={iconColor}
        iconBg={iconBg}
        onClose={onClose}
      />
      <Modal.Body>
        {isSuccess && items.length > 0 && (
          <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              {items.map((item, idx) => (
                <div key={idx} className={item.fullWidth ? 'col-span-2' : 'col-span-1'}>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">{item.label}</span>
                  <span className={`font-semibold ${item.isHighlight ? 'text-emerald-600 dark:text-emerald-400 text-sm font-extrabold' : item.isMono ? 'font-mono text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                    {item.value || 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isError && (
          <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 space-y-2 text-xs">
            {errorObj?.code && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 font-mono">
                CODE: {errorObj.code}
              </span>
            )}
            <p className="font-semibold text-rose-900 dark:text-rose-200 text-xs">
              {errorObj?.message || 'An error occurred during transaction processing.'}
            </p>
            {errorObj?.details && (
              <p className="text-[11px] font-mono text-rose-700 dark:text-rose-400 pt-1 border-t border-rose-200 dark:border-rose-900/40">
                {errorObj.details}
              </p>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {isError && onRetry && (
          <Button variant="outlined" size="sm" onClick={onRetry}>
            Retry Action
          </Button>
        )}
        <Button
          variant="contained"
          size="sm"
          onClick={onClose}
          className={isError ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}
        >
          {isSuccess ? 'Done' : 'Dismiss'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ResponseModal;
