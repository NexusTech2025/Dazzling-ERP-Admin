import React, { useState, useEffect } from 'react';
import Modal from '../../../../../../components/ui/Modal';
import Button from '../../../../../../components/ui/v2/Button';
import { openWhatsAppShare } from '../utils/whatsappShareUtils';

/**
 * Interactive preview dialog rendering a WhatsApp message bubble preview before broadcasting.
 * Optimized for mobile viewport height expansion and flex-grow text editing.
 */
export default function WhatsAppShareModal({
  isOpen,
  onClose,
  title = 'Share Report via WhatsApp',
  message = '',
  phone = ''
}) {
  const [editableMessage, setEditableMessage] = useState(message);

  useEffect(() => {
    setEditableMessage(message);
  }, [message, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="h-[92vh] max-h-[92vh] sm:h-auto sm:max-h-[85vh]"
    >
      <Modal.Header
        title={title}
        subtitle="Preview and customize your message before broadcasting to WhatsApp groups or parents"
        icon="chat"
        iconColor="text-emerald-600 dark:text-emerald-400"
        iconBg="bg-emerald-100 dark:bg-emerald-950/50"
        onClose={onClose}
      />

      <Modal.Body className="flex-1 flex flex-col min-h-0 p-3 sm:p-2 space-y-2 sm:space-y-3 overflow-hidden">
        {/* WhatsApp Chat Bubble Stylized Flex Container */}
        <span>WHATSAPP MESSAGE PREVIEW</span>
        <div className="flex-1 flex flex-col min-h-0  rounded-2xl  shadow-inner space-y-2 font-sans">
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-400  shrink-0">
            {phone && <span>Target Parent: +91 {phone.slice(-10)}</span>}
          </div>

          <textarea
            value={editableMessage}
            onChange={(e) => setEditableMessage(e.target.value)}
            className="flex-1 min-h-[200px] w-full p-3 rounded-xl bg-white dark:bg-[#111B21] text-sm font-mono text-slate-800 dark:text-slate-100 border border-emerald-500/30 focus:ring-2 focus:ring-emerald-500 outline-none resize-none leading-relaxed"
          />
        </div>

        <p className="text-[11px] text-text-secondary italic shrink-0">
          💡 Tip: WhatsApp supports *bold*, _italics_, and bullet points. Choose where to send using the buttons below.
        </p>
      </Modal.Body>

      <Modal.Footer className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 shrink-0">
        <Button variant="outlined" size="sm" onClick={onClose}>
          Cancel
        </Button>

        <div className="flex items-center gap-2">
          {/* Action Button 1: General Share (Group / Contact Picker in WhatsApp) */}
          <Button
            variant="contained"
            size="sm"
            startIcon="groups"
            onClick={() => {
              openWhatsAppShare(editableMessage, ''); // Triggers WhatsApp Group/Contact selection
              onClose();
            }}
            className="!bg-emerald-600 hover:!bg-emerald-700 !text-white"
          >
            Share to Group / Contact
          </Button>

          {/* Action Button 2: Direct Parent Chat (if student phone available) */}
          {phone && (
            <Button
              variant="outlined"
              size="sm"
              startIcon="person"
              onClick={() => {
                openWhatsAppShare(editableMessage, phone); // Direct parent chat
                onClose();
              }}
              className="!text-emerald-600 !border-emerald-500/30 hover:!bg-emerald-500/10"
            >
              Direct to Parent
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}
