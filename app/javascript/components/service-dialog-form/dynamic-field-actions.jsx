import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'carbon-components-react';
import { Close16, Edit16 } from '@carbon/icons-react';
import { SD_ACTIONS, SD_PROP_SHAPES } from './helper';
import EditFieldModal from './edit-field-modal';

/** Component to render a Field. */
const DynamicFieldActions = ({
  componentId, fieldProps, updateFieldProps, dynamicFieldAction, fieldConfiguration, dynamicToggleAction,
}) => {
  const [{ showModal, ...editedFields }, setState] = useState({ showModal: false });

  const onModalHide = () => setState((state) => ({ ...state, showModal: false }));
  const onModalShow = () => setState((state) => ({ ...state, showModal: true }));
  // const onModalApply = () => setState((state) => ({ ...state, showModal: false }));
  const onModalApply = (formValues, event) => {
    setState((prevState) => ({ ...prevState, showModal: false, ...formValues }));
    dynamicFieldAction(event, formValues);
  };

  const onDynamicSwitchToggle = (isDynamic) => {
    setState((prevState) => ({ ...prevState, dynamic: isDynamic }));
    dynamicToggleAction(isDynamic);
  };

  const renderEditButton = () => (
    <Button
      renderIcon={Edit16}
      kind="ghost"
      iconDescription={__('Edit')}
      onClick={onModalShow}
      onKeyPress={(event) => dynamicFieldAction(SD_ACTIONS.field.edit, event)}
      title={__('Edit field')}
    />
  );

  const renderRemoveButton = () => (
    <Button
      renderIcon={Close16}
      kind="ghost"
      iconDescription={__('Remove')}
      onClick={(event) => dynamicFieldAction(SD_ACTIONS.field.delete, event)}
      onKeyPress={(event) => dynamicFieldAction(SD_ACTIONS.field.delete, event)}
      title={__('Remove field')}
    />
  );

  const renderEditFieldModal = () => (
    showModal && (
      <EditFieldModal
        componentId={componentId}
        fieldConfiguration={fieldConfiguration}
        showModal={showModal}
        onModalHide={onModalHide}
        onModalApply={onModalApply}
        // initialData={editedFields}
        initialData={fieldProps}
        onSave={(updatedFields) => {
          updateFieldProps(updatedFields);
          setState((state) => ({ ...state, showModal: false }));
        }}
        onDynamicSwitchToggle={onDynamicSwitchToggle}
      />
    )
  );

  return (
    <div className="dynamic-form-field-actions">
      {renderEditButton()}
      {renderRemoveButton()}
      {renderEditFieldModal()}
    </div>
  );
};

// DynamicFieldActions.propTypes = {
//   componentId: PropTypes.number.isRequired,
//   dynamicFieldAction: PropTypes.func.isRequired,
//   fieldConfiguration: PropTypes.arrayOf(PropTypes.any).isRequired,
// };

DynamicFieldActions.propTypes = {
  componentId: PropTypes.number.isRequired,
  fieldProps: PropTypes.oneOfType([
    SD_PROP_SHAPES.textbox,
    SD_PROP_SHAPES.textarea,
    SD_PROP_SHAPES.checkbox,
    SD_PROP_SHAPES.dropdown,
    SD_PROP_SHAPES.multiselectDropdown,
    SD_PROP_SHAPES.radiobutton,
    SD_PROP_SHAPES.datePicker,
    SD_PROP_SHAPES.dateTimePicker,
    SD_PROP_SHAPES.tagControl,
  ]).isRequired,
  updateFieldProps: PropTypes.func.isRequired,
  dynamicFieldAction: PropTypes.func.isRequired,
  fieldConfiguration: PropTypes.arrayOf(PropTypes.any).isRequired,
  dynamicToggleAction: PropTypes.func.isRequired,
};

export default DynamicFieldActions;
