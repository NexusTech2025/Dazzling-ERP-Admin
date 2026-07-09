import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import FormField from '../../../components/ui/v2/FormField';
import TextInput from '../../../components/ui/v2/TextInput';
import SelectInput from '../../../components/ui/v2/SelectInput';
import Button from '../../../components/ui/v2/Button';

// Declarative Form Validation Schema
const categorySchema = yup.object().shape({
  segment_name: yup.string().trim().required('Category Name is required.'),
  entity_label: yup.string().required('Default Display Label is required.'),
  description: yup.string().ensure()
});

/**
 * Isolated CourseCategoryForm Subcomponent.
 * Mitigates master page re-render cascades on text inputs.
 * 
 * @param {Object} props
 * @param {Object|null} props.initialValues - Initial model structure containing segment parameters, or null.
 * @param {Function} props.onSubmit - Submission callback returning normalized form input payloads.
 * @param {boolean} props.isPending - Indicates if the request mutation is processing on the backend.
 * @param {Function} props.onCancel - Cancellation callback to reset edit modes.
 * @returns {React.JSX.Element}
 */
export const CourseCategoryForm = React.memo(({ initialValues, onSubmit, isPending, onCancel }) => {
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: initialValues || { segment_name: '', entity_label: 'Course', description: '' }
  });

  const entityLabelOptions = [
    { label: 'Course', value: 'Course' },
    { label: 'Subject', value: 'Subject' },
    { label: 'Program', value: 'Program' }
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
      <FormField label="Category Name" name="segment_name" required error={errors.segment_name?.message}>
        <TextInput
          {...register('segment_name')}
          placeholder="e.g. Computer Science, Academic Subjects"
          autoFocus
        />
      </FormField>

      <FormField label="Default Display Label" name="entity_label" required error={errors.entity_label?.message}>
        <Controller
          name="entity_label"
          control={control}
          render={({ field }) => (
            <SelectInput
              value={field.value}
              onChange={field.onChange}
              options={entityLabelOptions}
            />
          )}
        />
      </FormField>

      <FormField label="Description" name="description" error={errors.description?.message}>
        <textarea
          rows={4}
          {...register('description')}
          placeholder="Brief details about the target courses in this category..."
          className="w-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg py-2 px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 resize-none text-text-main dark:text-white placeholder:text-text-secondary/50"
        />
      </FormField>

      <div className="pt-4 flex items-center gap-3 border-t border-border-light dark:border-border-dark">
        <Button type="button" variant="outlined" onClick={onCancel} className="flex-1" disabled={isPending}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          loading={isPending}
          className="flex-1"
          startIcon={initialValues ? "save" : "add"}
        >
          {initialValues ? 'Save Changes' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
});

CourseCategoryForm.displayName = 'CourseCategoryForm';

export default CourseCategoryForm;
