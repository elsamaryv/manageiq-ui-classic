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

const EditFieldModal = ({
  componentId, fieldConfiguration, showModal, onModalHide, onModalApply, initialData
}) => {
  const [data, setData] = useState({
    initialValues: initialData,
  });
  // const [initialValues, setInitialValues] = useState({});


  const component = dynamicComponents.find((item) => item.id === componentId);

  const onSubmit = (formValues, event) => {
    onModalApply(formValues, event);
  };

  const onCancel = () => onModalHide();

  return (
    <Modal
      open={showModal}
      modalHeading={__(`Edit this ${component.title}`)}
      primaryButtonText={__('Save')}
      secondaryButtonText={__('Cancel')}
      onRequestSubmit={onModalApply}
      onRequestClose={onModalHide}
      passiveModal // Required to hide the save and cancel buttons on the Modal
      className="edit-field-modal"
    >
      <ModalBody className="edit-field-modal-body">
        <MiqFormRenderer
          schema={createSchema(fieldConfiguration)}
          initialValues={initialData}
          // canSubmit={false}
          // canCancel={false}
          onSubmit={onSubmit}
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
};

export default EditFieldModal;
