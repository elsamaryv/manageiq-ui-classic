import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'carbon-components-react';
import MiqFormRenderer from '@@ddf';
import { schemaHeaders, createEditableRows } from './helper';
import MiqDataTable from '../../miq-data-table';
import createClassFieldsSchema from './modal-form.schema';
import { CellAction } from '../../miq-data-table/helper';

export const ClassFieldsEditor = (props) => {
  const {
    aeClassId, initialData, aeTypeOptions, dTypeOptions 
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
  });

  const handleOnAddFieldClick = () => {
    setState((state) => ({ ...state, selectedRowId: undefined, isModalOpen: true }));
  };

  const deleteClassField = (selectedRow) => {
    const rowId = parseInt(selectedRow.id, 10);

    // setState((prevState) => ({
    //   ...prevState,
    //   schemaRecords: prevState.schemaRecords.filter((_, i) => i !== rowId),
    // }));
  };

  const editClassField = (selectedRow) => {
    const rowId = parseInt(selectedRow.id, 10);
    setState((state) => ({
      ...state,
      selectedRowId: rowId,
      isModalOpen: true,
      // form: {
      //   type: 'replication',
      //   className: 'replication_form',
      //   action: 'edit',
      // },
      // selectedSubscription: subscriptions[rowId],
    }));
  };

  const onCellClick = (selectedRow, cellType, event) => {
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

  const onModalSubmit = (values) => {
    debugger

    http.post(`/miq_ae_class/field_accept?button=accept`, values, {
      skipErrors: [400],
    }).then((response) => {
      debugger
      console.log(response);

      setState((prevState) => ({
        ...prevState,
        schemaRecords: [...prevState.schemaRecords, values],
      }));
      // }
    }).catch((error) => {
      console.error('Response:', error.response);
    });

    handleModalClose();
  };

  return (
    <>
      {renderAddFieldButton()}

      <Modal
        open={state.isModalOpen}
        modalHeading="ABCDEF"
        onRequestClose={handleModalClose}
        passiveModal
      >
        <MiqFormRenderer
          schema={createClassFieldsSchema(
            aeClassId,
            aeTypeOptions,
            dTypeOptions,
            state.selectedRowId,
            state.rows[state.selectedRowId]
          )}
          onSubmit={onModalSubmit}
          onCancel={handleModalClose}
          canReset
          buttonsLabels={{ submitLabel: __('Accept') }}
        />
      </Modal>

      <MiqDataTable
        headers={[
          { key: 'name', header: __('Name') },
          { key: 'description', header: __('Description') },
          { key: 'default_value', header: __('DefaultValue') },
          { key: 'collect', header: __('Collect') },
          { key: 'message', header: __('Message') },
          { key: 'on_entry', header: __('OnEntry') },
          { key: 'on_exit', header: __('OnExit') },
          { key: 'on_error', header: __('OnError') },
          { key: 'max_entries', header: __('MaxRetries') },
          { key: 'max_time', header: __('MaxTime') },
          { key: 'edit', header: __('Edit') },
          { key: 'delete', header: __('Delete') },
        ]}
        rows={transformedRows()}
        size="md"
        sortable={false}
        onCellClick={(selectedRow, cellType, event) =>
          onCellClick(selectedRow, cellType, event)}
      />
      <>
        <MiqFormRenderer
          onSubmit={() => {}}
          onCancel={() => {}}
          canReset
          buttonsLabels={{ submitLabel: __('Save') }}
        />
      </>
    </>
  );
};

ClassFieldsEditor.propTypes = {
  aeClassId: PropTypes.number.isRequired,
  initialData: PropTypes.arrayOf(PropTypes.any).isRequired,
  aeTypeOptions: PropTypes.arrayOf(PropTypes.any),
  dTypeOptions: PropTypes.arrayOf(PropTypes.any),
  // onCellClick: PropTypes.func.isRequired,
};

ClassFieldsEditor.defaultProps = {
  aeTypeOptions: [],
  dTypeOptions: [],
};
