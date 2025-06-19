import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'carbon-components-react';
import MiqFormRenderer from '@@ddf';
import { schemaHeaders, createEditableRows } from './helper';
import MiqDataTable from '../../miq-data-table';
import createClassFieldsSchema from './modal-form.schema';
import { CellAction } from '../../miq-data-table/helper';
// import miqRedirectBack from '../../helpers/miq-redirect-back';

export const ClassFieldsEditor = (props) => {
  const {
    initialData, aeTypeOptions, dTypeOptions,
  } = props;

  const fieldData = createEditableRows(initialData);

  const transformedRows = () => {
    const rowItems = [];
    const headers = schemaHeaders(true);
    fieldData.forEach(({
      cells, id, clickable, clickId,
    }) => {
      const reducedItems = cells.reduce((result, item, index) => {
        result[headers[index].name] = item;
        result.id = id;
        if (clickId) result.clickId = clickId;
        result.clickable = clickable;
        return result;
      }, {});
      // reducedItems.id = id;
      rowItems.push(reducedItems);
    });
    return rowItems;
  };

  const [state, setState] = useState({
    isModalOpen: false,
    selectedRowId: undefined,
    rows: transformedRows(),
    formKey: true, // for remounting
  });

  const handleOnAddFieldClick = () => {
    setState((state) => ({
      ...state,
      selectedRowId: undefined,
      isModalOpen: true,
      formKey: !state.formKey,
    }));
  };

  const editClassField = (selectedRow) => {
    const rowId = selectedRow.id;
    setState((state) => ({
      ...state,
      selectedRowId: rowId,
      isModalOpen: true,
      formKey: !state.formKey,
    }));
  };

  const deleteClassField = (selectedRow) => {
    setState((prevState) => ({
      ...prevState,
      rows: prevState.rows.filter((field) => field.id !== selectedRow.id),
    }));
  };

  const onCellClick = (selectedRow, cellType) => {
    setState((state) => ({ ...state, selectedRowId: selectedRow.id }));
    switch (cellType) {
      case CellAction.buttonCallback: {
        switch (selectedRow.callbackAction) {
          case 'editClassField':
            editClassField(selectedRow);
            break;
          case 'deleteClassField':
            deleteClassField(selectedRow);
            break;
          default:
            break;
        }
        break;
      }
      // default: onItemClick(findItem(selectedRow)); break;
      default: break;
    }
  };

  const handleModalClose = () => {
    // setModalOpen(false);
    setState((state) => ({ ...state, isModalOpen: false }));
  };

  const renderAddFieldButton = () => (
    <div className="custom-accordion-buttons">
      <Button
        kind="primary"
        className="btnRight"
        type="submit"
        title={__('Click to add a new field')}
        onClick={handleOnAddFieldClick}
        // onClick={() => setModalOpen(true)}
        // onKeyPress={() => onSelect('new')}
      >
        {__('Add a Field')}
      </Button>
    </div>
  );

  const formatFieldValues = (field, id) => {
    if (!field || typeof field !== 'object') return [];

    const row = {
      id: (field.id || id).toString(),
      name: { text: field.name, icon: field.icons },
      aetype: { text: field.aetype },
      datatype: { text: field.datatype },
      default_value: { text: field.default_value || '' },
      display_name: { text: field.display_name || '' },
      description: { text: field.description || '' },
      substitute: { text: field.substitute },
      collect: { text: field.collect || '' },
      message: { text: field.message || '' },
      on_entry: { text: field.on_entry || '' },
      on_exit: { text: field.on_exit || '' },
      on_error: { text: field.on_error || '' },
      max_retries: { text: field.max_retries || '' },
      max_time: { text: field.max_time || '' },
      edit: {
        is_button: true,
        text: __('Update'),
        kind: 'tertiary',
        size: 'md',
        callback: 'editClassField',
      },
      delete: {
        is_button: true,
        text: __('Delete'),
        kind: 'danger',
        size: 'md',
        callback: 'deleteClassField',
      },
    };

    return row;
  };

  const onModalSubmit = (values) => {
    const isEdit = state.selectedRowId !== undefined;
    const data = formatFieldValues(values, isEdit ? state.selectedRowId : state.rows.length);

    const updateState = (newData) => {
      setState((prevState) => ({
        ...prevState,
        rows: isEdit
          ? prevState.rows.map((field) => (field.id === newData.id ? newData : field))
          : [...prevState.rows, newData],
      }));
      handleModalClose();
    };

    if (isEdit) {
      updateState(data);
    } else {
      http.post(`/miq_ae_class/field_accept?button=accept`, values, { skipErrors: [400] })
        .then(() => updateState(data))
        .catch((error) => {
          console.error('Failed to save new field:', error);
        });
    }
  };

  // const onCancel = () => {
  //   debugger
  //   miqSparkleOn();
  //   const message = __('Edit of schema field was cancelled by the user');
  //   miqRedirectBack(message, 'warning', '/miq_ae_class/explorer');
  // };

  const onCancel = () => {
    miqSparkleOn();
    // miqAjaxButton(`/miq_ae_class/explorer`);
    window.location.reload();
  };

  return (
    <>
      {renderAddFieldButton()}

      <Modal
        open={state.isModalOpen}
        modalHeading={state.selectedRowId === undefined ? __('Add New Field') : __('Edit Field')}
        onRequestClose={handleModalClose}
        passiveModal
      >
        <MiqFormRenderer
          key={state.formKey}
          schema={createClassFieldsSchema(
            aeTypeOptions,
            dTypeOptions,
            state.selectedRowId,
            state.rows[state.selectedRowId]
          )}
          onSubmit={onModalSubmit}
          onCancel={handleModalClose}
          canReset
          buttonsLabels={{ submitLabel: __('Save') }}
        />
      </Modal>

      <MiqDataTable
        headers={[
          { key: 'name', header: __('Name') },
          { key: 'description', header: __('Description') },
          { key: 'default_value', header: __('Default Value') },
          { key: 'collect', header: __('Collect') },
          { key: 'message', header: __('Message') },
          { key: 'on_entry', header: __('On Entry') },
          { key: 'on_exit', header: __('On Exit') },
          { key: 'on_error', header: __('On Error') },
          { key: 'max_retries', header: __('Max Retries') },
          { key: 'max_time', header: __('Max Time') },
          { key: 'edit', header: __('Edit') },
          { key: 'delete', header: __('Delete') },
        ]}
        rows={state.rows}
        size="md"
        sortable={false}
        onCellClick={(selectedRow, cellType, event) =>
          onCellClick(selectedRow, cellType, event)}
      />
      <>
        <MiqFormRenderer
          onSubmit={() => {}}
          onCancel={onCancel}
          canReset
          buttonsLabels={{ submitLabel: __('Save') }}
        />
      </>
    </>
  );
};

ClassFieldsEditor.propTypes = {
  // aeClassId: PropTypes.number.isRequired,
  initialData: PropTypes.arrayOf(PropTypes.any).isRequired,
  aeTypeOptions: PropTypes.arrayOf(PropTypes.any),
  dTypeOptions: PropTypes.arrayOf(PropTypes.any),
  // onCellClick: PropTypes.func.isRequired,
};

ClassFieldsEditor.defaultProps = {
  aeTypeOptions: [],
  dTypeOptions: [],
};
