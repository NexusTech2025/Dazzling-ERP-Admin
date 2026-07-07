import React, { useState, useEffect } from 'react';
import Button from '../../../../components/ui/v2/Button';
import FormField from '../../../../components/ui/v2/FormField';
import SelectInput from '../../../../components/ui/v2/SelectInput';
import TextInput from '../../../../components/ui/v2/TextInput';
import IconButton from '../../../../components/ui/v2/IconButton';

const DOCUMENT_TYPE_OPTIONS = [
  { label: 'ID Proof', value: 'id_proof' },
  { label: 'Resume / CV', value: 'resume' },
  { label: 'Other', value: 'other' }
];

const DOCUMENT_TYPE_ICONS = {
  id_proof: 'badge',
  resume: 'description',
  other: 'attach_file'
};

const initialState = {
  document_type: 'resume',
  file_url: '',
  display_name: ''
};

/**
 * DocumentUploadModal: Collects a document type and file URL for a new teacher verification document.
 * Used during onboarding registration to accumulate documents locally before submission.
 *
 * @param {boolean} isOpen - Controls modal visibility.
 * @param {function} onClose - Called to dismiss the modal.
 * @param {function} onSubmit - Called with { document_type, file_url, display_name } on confirm.
 * @param {Object} [document] - If provided, pre-fills fields for editing an existing document entry.
 */
const DocumentUploadModal = ({ isOpen, onClose, onSubmit, document = null }) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (document) {
        setFormData({
          document_type: document.document_type || 'resume',
          file_url: document.file_url || '',
          display_name: document.display_name || ''
        });
      } else {
        setFormData(initialState);
      }
      setErrors({});
    }
  }, [isOpen, document]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.file_url.trim()) {
      newErrors.file_url = 'File URL is required.';
    } else if (!/^https?:\/\/.+/.test(formData.file_url.trim())) {
      newErrors.file_url = 'Please enter a valid URL starting with http:// or https://';
    }
    if (!formData.document_type) {
      newErrors.document_type = 'Document type is required.';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      document_type: formData.document_type,
      file_url: formData.file_url.trim(),
      display_name: formData.display_name.trim() || formData.file_url.trim().split('/').pop()
    };

    console.log('[DocumentUploadModal] Submitting document:', payload);
    onSubmit(payload);
  };

  if (!isOpen) return null;

  const selectedTypeIcon = DOCUMENT_TYPE_ICONS[formData.document_type] || 'attach_file';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200">
      <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-background-light dark:bg-slate-950/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-lg">{selectedTypeIcon}</span>
            </div>
            <h3 className="text-base font-bold text-text-main dark:text-white leading-none">
              {document ? 'Edit Document' : 'Upload Document'}
            </h3>
          </div>
          <IconButton
            icon="close"
            onClick={onClose}
            aria-label="Close document modal"
          />
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">

            {/* Document Type Selector */}
            <FormField
              label="Document Type"
              name="document_type"
              required
              error={errors.document_type}
            >
              <SelectInput
                value={formData.document_type}
                onChange={(val) => handleChange('document_type', val)}
                options={DOCUMENT_TYPE_OPTIONS}
              />
            </FormField>

            {/* File URL */}
            <FormField
              label="File URL"
              name="file_url"
              required
              subText="Provide the publicly accessible URL to the uploaded document file."
              error={errors.file_url}
            >
              <TextInput
                value={formData.file_url}
                onChange={(e) => handleChange('file_url', e.target.value)}
                placeholder="https://storage.dazzling.erp/docs/resume.pdf"
                leftIcon="link"
                trim
              />
            </FormField>

            {/* Display Name (optional) */}
            <FormField
              label="Display Name"
              name="display_name"
              subText="Optional friendly label (e.g. 'Aadhaar Card'). Defaults to filename."
            >
              <TextInput
                value={formData.display_name}
                onChange={(e) => handleChange('display_name', e.target.value)}
                placeholder="e.g. Aadhaar Card Front"
                trim
              />
            </FormField>

            {/* Preview Row */}
            {formData.file_url && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 animate-in fade-in duration-200">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-sm">{selectedTypeIcon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-main dark:text-white truncate">
                    {formData.display_name || formData.file_url.split('/').pop() || 'Document'}
                  </p>
                  <p className="text-[10px] text-text-secondary truncate">{formData.file_url}</p>
                </div>
                <a
                  href={formData.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto flex-shrink-0 text-primary hover:text-primary/70 transition-colors"
                  title="Open link"
                >
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                </a>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/30 flex justify-end gap-3">
            <Button variant="text" size="sm" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="contained" size="sm" type="submit" startIcon="check_circle">
              {document ? 'Update Document' : 'Add Document'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUploadModal;
