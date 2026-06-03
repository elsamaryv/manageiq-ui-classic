import React, { useState, useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { Button, ButtonSet } from '@carbon/react';
import SequenceList from './sequence-list';

/**
 * Allows reordering of schema fields using drag-and-drop with multi-select
 */
const SchemaSequenceEditor = ({ classId }) => {
  const [fields, setFields] = useState([]);
  const [originalFields, setOriginalFields] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchFields = async() => {
      try {
        const url = `/miq_ae_class/fields_seq_data?id=${classId}`;
        const response = await fetch(url);
        const data = await response.json();
        const fetchedFields = data.fields || [];
        setFields(fetchedFields);
        setOriginalFields(JSON.parse(JSON.stringify(fetchedFields)));
      } catch (error) {
        console.error('Error fetching fields:', error);
      }
    };

    if (classId) {
      fetchFields();
    }
  }, [classId]);

  // Check if fields have changed
  useEffect(() => {
    const fieldsChanged = JSON.stringify(fields.map((f) => f.id))
      !== JSON.stringify(originalFields.map((f) => f.id));
    setHasChanges(fieldsChanged);
  }, [fields, originalFields]);

  const handleFieldsChange = (newFields) => {
    setFields(newFields);
  };

  const handleSave = async() => {
    setSaving(true);
    try {
      const updatedFields = fields.map((field, idx) => ({
        id: field.id,
        priority: idx + 1,
      }));

      const response = await fetch(`/miq_ae_class/fields_seq_save?id=${classId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        },
        body: JSON.stringify({ fields: updatedFields }),
      });

      const result = await response.json();
      if (result.success) {
        // Update original fields to match current state
        setOriginalFields(JSON.parse(JSON.stringify(fields)));
        setHasChanges(false);
        window.location.reload();
      } else {
        console.error('Error saving field order:', result.error);
        alert(__('Error saving field order: ') + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving field order:', error);
      alert(__('Error saving field order: ') + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFields(JSON.parse(JSON.stringify(originalFields)));
    setHasChanges(false);
  };

  const handleCancel = () => {
    window.location.reload();
  };

  return (
    <div className="schema-sequence-editor">
      <p className="helper-text">
        {__('Drag and drop fields to reorder them. Select multiple consecutive fields using checkboxes to drag them together. Click Save when finished.')}
      </p>
      <SequenceList
        fields={fields}
        onFieldsChange={handleFieldsChange}
        classId={classId}
      />
      <ButtonSet>
        <Button
          kind="primary"
          disabled={!hasChanges || saving}
          onClick={handleSave}
          type="button"
        >
          {saving ? __('Saving...') : __('Save')}
        </Button>
        <Button
          kind="secondary"
          disabled={!hasChanges || saving}
          onClick={handleReset}
          type="button"
        >
          {__('Reset')}
        </Button>
        <Button
          kind="secondary"
          disabled={saving}
          onClick={handleCancel}
          type="button"
        >
          {__('Cancel')}
        </Button>
      </ButtonSet>
    </div>
  );
};

SchemaSequenceEditor.propTypes = {
  classId: PropTypes.string.isRequired,
};

export default SchemaSequenceEditor;
