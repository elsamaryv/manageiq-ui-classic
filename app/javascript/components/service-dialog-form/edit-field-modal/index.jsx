import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import {
  Tabs,
  Tab,
  Modal, ModalBody,
} from 'carbon-components-react';
import { dynamicComponents } from '../data';
import { createSchema } from './edit-field-modal.schema';
import { propTypes } from 'react-markdown';

const EditFieldModal = ({
  componentId, fieldConfiguration, showModal, onModalHide, onModalApply, initialData, onSave, onDynamicSwitchToggle,
}) => {
  // const [data, setData] = useState({
  //   initialValues: initialData,
  // });
  // const [initialValues, setInitialValues] = useState({});


  const component = dynamicComponents.find((item) => item.id === componentId);

  // const onSubmit = (formValues, event) => {
  //   onModalApply(formValues, event);
  // };

  // const handleFieldUpdates = (event) => {
  //   if (event.target.name === 'dynamic') {
  //     onDynamicSwitchToggle(event.target.checked);
  //   }
  // };

  const handleFieldUpdates = ({ target: { name, checked } }) => {
    if (name === 'dynamic') {
      onDynamicSwitchToggle(checked);
    }
  };

  const onCancel = () => onModalHide();

  const handleSubmit = (formValues) => {
    onSave(formValues);
  };

  return (
    <Modal
      open={showModal}
      modalHeading={__(`Edit this ${component.title}`)}
      // primaryButtonText={__('Save')}
      // secondaryButtonText={__('Cancel')}
      // onRequestSubmit={onModalApply}
      onRequestClose={onModalHide}
      passiveModal // Required to hide the save and cancel buttons on the Modal
      className="edit-field-modal"
      onChange={handleFieldUpdates}
    >
      <ModalBody className="edit-field-modal-body">
        <MiqFormRenderer
          schema={createSchema(fieldConfiguration)}
          initialValues={initialData}
          // canSubmit={false}
          // canCancel={false}
          // onSubmit={onSubmit}
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
};

export default EditFieldModal;
