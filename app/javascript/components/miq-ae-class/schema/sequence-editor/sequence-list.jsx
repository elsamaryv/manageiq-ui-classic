import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Checkbox,
  InlineNotification,
} from '@carbon/react';
import { Draggable } from '@carbon/react/icons';

/**
 * Draggable list of schema fields with multi-select support
 * Uses Carbon DataTable directly to enable drag-and-drop functionality
 */
const SequenceList = ({
  fields, onFieldsChange, classId,
}) => {
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [draggedIndices, setDraggedIndices] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Setup form button handlers
  useEffect(() => {
    // Expose save handler to parent form
    window.miqAeFieldsSeqSave = async() => {
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
        return result;
      } catch (error) {
        console.error('Error saving field order:', error);
        return { success: false, error: error.message };
      }
    };

    return () => {
      delete window.miqAeFieldsSeqSave;
    };
  }, [fields, classId]);

  const handleCheckboxChange = (index) => {
    setErrorMessage('');
    setSelectedIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      return [...prev, index].sort((a, b) => a - b);
    });
  };

  const areIndicesConsecutive = (indices) => {
    if (indices.length <= 1) return true;
    const sorted = [...indices].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] - sorted[i - 1] !== 1) {
        return false;
      }
    }
    return true;
  };

  const handleDragEnd = () => {
    setDraggedIndices([]);
  };

  if (fields.length === 0) {
    return (
      <div className="sequence-list">
        <div className="empty-state">
          {__('No fields to display')}
        </div>
      </div>
    );
  }

  const headers = [
    { key: 'select', header: '' },
    { key: 'name', header: __('Name') },
  ];

  const rows = fields.map((field, index) => ({
    id: String(field.id),
    select: index,
    name: field.display_name ? `${field.display_name} (${field.name})` : `(${field.name})`,
    field,
    index,
  }));

  const handleDragStart = (e, index) => {
    if (selectedIndices.includes(index) && selectedIndices.length > 1) {
      if (!areIndicesConsecutive(selectedIndices)) {
        e.preventDefault();
        setErrorMessage(__('Cannot drag non-consecutive items. Please select consecutive items only.'));
        return;
      }
      setDraggedIndices(selectedIndices);
    } else {
      setDraggedIndices([index]);
    }
    setErrorMessage('');
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, targetIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedIndices.length === 0 || draggedIndices.includes(targetIndex)) {
      return;
    }

    const newFields = [...fields];
    const draggedFields = draggedIndices.map((i) => newFields[i]);

    // Remove dragged items (in reverse order to maintain indices)
    [...draggedIndices].sort((a, b) => b - a).forEach((i) => {
      newFields.splice(i, 1);
    });

    let insertIndex = targetIndex;
    draggedIndices.forEach((i) => {
      if (i < targetIndex) {
        insertIndex--;
      }
    });

    // Insert at new position
    newFields.splice(insertIndex, 0, ...draggedFields);

    const newSelectedIndices = draggedFields.map((_, i) => insertIndex + i);
    setSelectedIndices(newSelectedIndices);
    setDraggedIndices(newSelectedIndices);

    onFieldsChange(newFields);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="sequence-list">
      {errorMessage && (
        <InlineNotification
          kind="error"
          title={__('Error')}
          subtitle={errorMessage}
          onCloseButtonClick={() => setErrorMessage('')}
          lowContrast
          hideCloseButton={false}
          style={{ marginBottom: '1rem' }}
        />
      )}
      <DataTable rows={rows} headers={headers}>
        {({
          rows: dataRows, headers: dataHeaders, getTableProps, getHeaderProps, getRowProps,
        }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {dataHeaders.map((header) => (
                  <TableHeader {...getHeaderProps({ header })} key={header.key}>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {dataRows.map((row) => {
                const isSelected = selectedIndices.includes(row.cells[0].value);
                return (
                  <TableRow
                    {...getRowProps({ row })}
                    key={row.id}
                    className={isSelected ? 'selected-row' : ''}
                    draggable
                    onDragStart={(e) => handleDragStart(e, row.cells[0].value)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, row.cells[0].value)}
                    onDrop={handleDrop}
                  >
                    <TableCell key={`${row.id}-select`}>
                      <Checkbox
                        id={`checkbox-${row.id}`}
                        checked={isSelected}
                        onChange={() => handleCheckboxChange(row.cells[0].value)}
                        labelText=""
                      />
                    </TableCell>
                    <TableCell key={`${row.id}-name`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Draggable size={16} />
                        <span>{row.cells[1].value}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </DataTable>
      {/* Drop zone after last row */}
      <div
        className="drop-zone-after-last"
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          if (draggedIndices.length > 0) {
            handleDragOver(e, fields.length);
          }
        }}
        onDrop={handleDrop}
        style={{
          height: '2rem',
          borderTop: draggedIndices.length > 0 ? '2px dashed #0f62fe' : 'none',
        }}
      />
    </div>
  );
};

SequenceList.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    display_name: PropTypes.string,
    priority: PropTypes.number.isRequired,
  })).isRequired,
  onFieldsChange: PropTypes.func.isRequired,
  classId: PropTypes.string.isRequired,
};

export default SequenceList;
