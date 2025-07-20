import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import {
  Tabs,
  Tab,
  Modal, ModalBody,
} from 'carbon-components-react';
import { dynamicComponents } from '../data';
import { createSchema } from './edit-field-modal.schema';
// import { componentTypes } from '../component-types';
// import componentMapper from '../../../forms/mappers/componentMapper';
// import CustomDateTimePicker from '../../date-time-picker';

const EditFieldModal = ({
  componentId, fieldConfiguration, showModal, onModalHide, onModalApply, initialData,
  onSave, onDynamicSwitchToggle, onCategorySelect, onTimePickerChange,
}) => {
  const component = dynamicComponents.find((item) => item.id === componentId);

  const [newFieldValues, setnewFieldValues] = useState();

  const handleFieldUpdates = ({ target }) => {
    if (target.name === 'dynamic') {
      onDynamicSwitchToggle(target.checked);
    }
    if (target.name === 'categories') {
      onCategorySelect(target.value);
    }
  };

  const onCancel = () => onModalHide();

  const handleSubmit = (formValues, e) => {
    const newFormValues = { ...formValues, ...newFieldValues };
    onSave(e, newFormValues);
    // onSave(e, formValues);
  };

  const onChange = (data) => {
    if (data != null && data.initialData.label === 'Timepicker') {
      onTimePickerChange(data.value);
      setnewFieldValues({ value: data.value });
    }
  };

  return (
    <Modal
      open
      modalHeading={__(`Edit this ${component.title}`)}
      onRequestClose={onModalHide}
      passiveModal // Required to hide the save and cancel buttons on the Modal
      className="edit-field-modal"
      onChange={handleFieldUpdates}
    >
      <ModalBody className="edit-field-modal-body">
        <MiqFormRenderer
          schema={createSchema(fieldConfiguration, initialData, onChange)}
          initialValues={initialData}
          // componentMapper={mapper}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      </ModalBody>
    </Modal>
  );
};

EditFieldModal.propTypes = {
  componentId: PropTypes.number.isRequired,
  fieldConfiguration: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    fields: PropTypes.arrayOf(PropTypes.any),
  })).isRequired,
  showModal: PropTypes.bool.isRequired,
  onModalHide: PropTypes.func.isRequired,
  onModalApply: PropTypes.func.isRequired,
  initialData: PropTypes.objectOf(PropTypes.any).isRequired,
  onSave: PropTypes.func.isRequired,
  onDynamicSwitchToggle: PropTypes.func.isRequired,
  onCategorySelect: PropTypes.func.isRequired,
};

export default EditFieldModal;
