import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import { Modal, ModalBody } from 'carbon-components-react';
import { createSchema } from './modal-fields.schema';

const EditSectionModal = ({
  sectionName, showModal, onSave, onModalHide,
}) => {
  console.log("EditSectionModal is being executed!");
  debugger
  
  
  const onCancel = () => onModalHide();

  const handleSubmit = (formValues, e) => {
    onSave(e, formValues);
  };

  return (
    <Modal
      open={showModal}
      modalHeading={__(`Edit this ${sectionName}`)}
      onRequestClose={onModalHide}
      passiveModal // Required to hide the save and cancel buttons on the Modal
      className="edit-section-modal"
      // onChange={handleFieldUpdates}
    >
      <ModalBody className="edit-section-modal-body">
        <MiqFormRenderer
          schema={createSchema()}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      </ModalBody>
    </Modal>
  );
};

EditSectionModal.propTypes = {
  sectionName: PropTypes.string.isRequired,
  showModal: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onModalHide: PropTypes.func.isRequired,
};

export default EditSectionModal;
