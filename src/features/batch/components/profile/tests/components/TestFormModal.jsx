import React, { useState, useEffect } from 'react';
import Modal from '../../../../../../components/ui/Modal';
import FormField from '../../../../../../components/ui/v2/FormField';
import TextInput from '../../../../../../components/ui/v2/TextInput';
import DateInput from '../../../../../../components/ui/v2/DateInput';
import SelectInput from '../../../../../../components/ui/v2/SelectInput';
import Button from '../../../../../../components/ui/v2/Button';

const STATUS_OPTIONS = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Published', label: 'Published' },
  { value: 'Completed', label: 'Completed' },
];

export default function TestFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false
}) {
  const [formData, setFormData] = useState({
    title: '',
    test_date: new Date().toISOString().split('T')[0],
    total_marks: 100,
    passing_marks: 40,
    status: 'Draft',
    remarks: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        test_date: initialData.test_date ? initialData.test_date.split('T')[0] : new Date().toISOString().split('T')[0],
        total_marks: initialData.total_marks || 100,
        passing_marks: initialData.passing_marks || 40,
        status: initialData.status || 'Draft',
        remarks: initialData.remarks || ''
      });
    } else {
      setFormData({
        title: '',
        test_date: new Date().toISOString().split('T')[0],
        total_marks: 100,
        passing_marks: 40,
        status: 'Draft',
        remarks: ''
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header
        title={initialData ? 'Edit Test Details' : 'Create New Test'}
        subtitle={initialData ? 'Update test parameters and scoring rules' : 'Define test details, schedule date, total marks, and passing criteria'}
        icon="assignment"
        onClose={onClose}
      />
      <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
        <Modal.Body className="space-y-4">
          <FormField label="Test Title *" subtext="Enter a descriptive title (e.g. Mathematics Unit Test - 1)">
            <TextInput
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Mathematics Unit Test - 1"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Test Date *">
              <DateInput
                value={formData.test_date}
                onChange={(e) => handleChange('test_date', e.target.value)}
                required
              />
            </FormField>

            <FormField label="Status *">
              <SelectInput
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                options={STATUS_OPTIONS}
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Total Marks *">
              <TextInput
                type="number"
                value={formData.total_marks}
                onChange={(e) => handleChange('total_marks', Number(e.target.value))}
                min={1}
                required
              />
            </FormField>

            <FormField label="Passing Marks *">
              <TextInput
                type="number"
                value={formData.passing_marks}
                onChange={(e) => handleChange('passing_marks', Number(e.target.value))}
                min={0}
                required
              />
            </FormField>
          </div>

          <FormField label="Remarks" subtext="Optional notes or topics covered">
            <TextInput
              value={formData.remarks}
              onChange={(e) => handleChange('remarks', e.target.value)}
              placeholder="Chapters 1-3 included..."
            />
          </FormField>
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            {initialData ? 'Update Test' : 'Create Test'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
