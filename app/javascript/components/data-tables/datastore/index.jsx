/* eslint-disable no-undef */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, MiqFormRenderer } from 'carbon-components-react';
import {
  tableData, addSelected, removeSelected,
} from './helper';
import MiqDataTable from '../../miq-data-table';
import { CellAction } from '../../miq-data-table/helper';

const Datastore = ({
  type, initialData, hasOptions, datastoreTypes, isEdit,
}) => {
  const {
    miqHeaders, miqRows, hasCheckbox, nodeTree,
  } = tableData(type, hasOptions, initialData, datastoreTypes, isEdit);

  const [state, setState] = useState({
    schemaRecords: miqRows.rowItems,
  });

  const [isModalOpen, setModalOpen] = useState(false);

  if (miqRows.merged) {
    miqHeaders.splice(0, 1);
  }

  const handleModalClose = () => {
    setModalOpen(false);
    // setState((state) => ({ ...state, selectedSubscription: {} }));
  };

  /** Function to find an item from initialData. */
  const findItem = (item) => initialData.find((row) => row.id.toString() === item.id.toString());

  /** The id's used for carbon-table checkbox selections. eg ['111','222','333']. */
  const itemIds = initialData.map((item) => item.id);

  /** The clickId's are used for ManageIQ.gridchecks. eg ['aen-111','aen-222','aen-333'].
   * These ids are used for click events of MiqToolbar. */
  const clickIds = initialData.map((item) => item.clickId);

  const [selectionIds, setSelectionIds] = useState([]);

  /** Function to update the checkbox selections states */
  const updateSelection = (selectedClickIds, selectedItemIds) => {
    ManageIQ.gridChecks = selectedClickIds;
    miqSetToolbarCount(selectedClickIds.length);
    setSelectionIds(selectedItemIds);
  };

  /** Function to check all checkboxes in table row from the data received from initialData. */
  const selectAll = () => updateSelection(clickIds, itemIds);

  /** Function to uncheck all checkboxes in table row */
  const unSelectAll = () => updateSelection([], []);

  /** Function to handle the select/unselect event when checkbox in table header is clicked. */
  const onSelectAll = (event) => {
    if (event.target.checked) {
      if (selectionIds.length > 0) {
        event.target.checked = false;
        unSelectAll();
      } else {
        selectAll();
      }
    } else {
      unSelectAll();
    }
  };

  /** Function to execute the row's click event to render item's show page. */
  const onItemClick = (selectedRow) => {
    if (selectedRow && selectedRow.clickable) {
      const url = `/miq_ae_class/${nodeTree}/`;
      miqJqueryRequest(`${url}?id=${selectedRow.clickId}`);
    }
  };

  /** Function to add item into carbon-table checkbox and ManageIQ.gridChecks. */
  const addItem = ({ id, clickId }) => ({
    selectedItemIds: addSelected(selectionIds, id),
    selectedClickIds: addSelected(ManageIQ.gridChecks || [], clickId),
  });

  /** Function to remove item from carbon-table checkbox and ManageIQ.gridChecks. */
  const removeItem = ({ id, clickId }) => ({
    selectedItemIds: removeSelected(selectionIds, id),
    selectedClickIds: removeSelected(ManageIQ.gridChecks || [], clickId),
  });

  /** Function to handle the select/unselect event when the checkbox in a row is clicked. */
  const onItemSelect = (item, target) => {
    const { selectedItemIds, selectedClickIds } = (target.checked) ? addItem(item) : removeItem(item);
    updateSelection(selectedClickIds, selectedItemIds);
  };

  const deleteClassField = (selectedRow) => {
    const rowId = parseInt(selectedRow.id, 10);

    setState((prevState) => ({
      ...prevState,
      schemaRecords: prevState.schemaRecords.filter((_, i) => i !== rowId),
    }));
  };

  /** Function to handle the cell event actions. */
  const onCellClick = (selectedRow, cellType, event) => {
    switch (cellType) {
      case CellAction.selectAll: onSelectAll(event); break;
      case CellAction.itemSelect: onItemSelect(findItem(selectedRow), event.target); break;
      case CellAction.itemClick: onItemClick(findItem(selectedRow)); break;
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
      default: onItemClick(findItem(selectedRow)); break;
    }
  };

  const renderAddFieldButton = () => (
    <div className="custom-accordion-buttons">
      <Button
        kind="primary"
        className="btnRight"
        type="submit"
        title={__('Click to add a new field')}
        onClick={() => setModalOpen(true)}
        // onKeyPress={() => onSelect('new')}
      >
        {__('Add a Field')}
      </Button>
    </div>
  );

  return (
    <>
      {isEdit && (
        <>
          {renderAddFieldButton()}

          <Modal
            open={isModalOpen}
            // modalHeading={selectedSubscription && Object.keys(selectedSubscription).length
            //   ? `Edit ${selectedSubscription.dbname}`
            //   : 'Add Subscription'}
            modalHeading="ABCDEF"
            onRequestClose={handleModalClose}
            passiveModal
          >
            {/* <MiqFormRenderer
              // schema={createSubscriptionSchema()}
              schema={{}}
              componentMapper={componentMapper}
              initialValues={initialData || {}}
              onSubmit={onModalSubmit}
              onCancel={handleModalClose}
              canReset
              buttonsLabels={{
                submitLabel: __('Create'),
              }}
            /> */}
          </Modal>
        </>
      )}
      <MiqDataTable
        rows={state.schemaRecords}
        headers={miqHeaders}
        onCellClick={(selectedRow, cellType, event) => onCellClick(selectedRow, cellType, event)}
        rowCheckBox={hasCheckbox}
        mode={`datastore-list ${type}`}
        gridChecks={selectionIds}
      />
    </>
  );
};

export default Datastore;

Datastore.propTypes = {
  type: PropTypes.string.isRequired,
  initialData: PropTypes.arrayOf(PropTypes.any).isRequired,
  hasOptions: PropTypes.bool,
  datastoreTypes: PropTypes.shape({}).isRequired,
  isEdit: PropTypes.bool.isRequired,
};

Datastore.defaultProps = {
  hasOptions: false,
};
