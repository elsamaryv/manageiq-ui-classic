import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import { Modal, ModalBody } from 'carbon-components-react';
import { createSchema } from './tab.schema';

const EditTabModal = ({
  tabName, showModal, onSave, onModalHide,
}) => {
  console.log("EditTabModal is being executed!");
  debugger
  
  const onCancel = () => onModalHide();

  const handleSubmit = (formValues, e) => {
    onSave(e, formValues);
  };

  return (
    <Modal
      open={showModal}
      modalHeading={__(`Edit this ${tabName}`)}
      onRequestClose={onModalHide}
      passiveModal // Required to hide the save and cancel buttons on the Modal
      className="edit-tab-modal"
      // onChange={handleFieldUpdates}
    >
      <ModalBody className="edit-tab-modal-body">
        <MiqFormRenderer
          schema={createSchema()}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      </ModalBody>
    </Modal>
  );
};

EditTabModal.propTypes = {
  tabName: PropTypes.string.isRequired,
  showModal: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onModalHide: PropTypes.func.isRequired,
};

export default EditTabModal;
