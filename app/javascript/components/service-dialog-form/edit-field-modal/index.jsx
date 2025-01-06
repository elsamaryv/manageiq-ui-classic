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
import { propTypes } from 'react-markdown';
// import { componentTypes } from '../component-types';
import componentMapper from '../../../forms/mappers/componentMapper';
import CustomDateTimePicker from '../../date-time-picker';
import miqRedirectBack from '../../../helpers/miq-redirect-back';

const EditFieldModal = ({
  componentId, fieldConfiguration, showModal, onModalHide, onModalApply, initialData,
  onSave, onDynamicSwitchToggle, onCategorySelect,
}) => {

 // const [data, setData] = useState({
  //   initialValues: initialData,
  // });
  // const [initialValues, setInitialValues] = useState({});


  const component = dynamicComponents.find((item) => item.id === componentId);

  // custom component mapper
  const mapper = {
    ...componentMapper,
    // [componentTypes.DATE_TIME_PICKER]: CustomDateTimePicker,
    'date-time-picker': CustomDateTimePicker,
  };

  // const onSubmit = (formValues, event) => {
  //   onModalApply(formValues, event);
  // };

  // const handleFieldUpdates = (event) => {
  //   if (event.target.name === 'dynamic') {
  //     onDynamicSwitchToggle(event.target.checked);
  //   }
  // };

  const handleFieldUpdates = ({ target }) => {
    if (target.name === 'dynamic') {
      onDynamicSwitchToggle(target.checked);
    }
    // if (target.name === 'categories') {
    //   debugger
    //   onCategorySelect(target.value);
    // }
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
          schema={createSchema(fieldConfiguration, initialData)}
          initialValues={initialData}
          componentMapper={mapper}
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
  onCategorySelect: PropTypes.func.isRequired,
};

export default EditFieldModal;
