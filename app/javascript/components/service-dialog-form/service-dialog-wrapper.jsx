import React from 'react';
import MiqFormRenderer from '@@ddf';
import { createSchema } from './dialog-wrapper.schema';

/** Component to wrap the service dialog form */
const ServiceDialogWrapper = () => {
  const customValidatorMapper = {
    customValidatorForNameField: () => (value) => {
      if (!value) {
        return __('Required');
      }
      if (!value.match('^[a-zA-Z0-9_.-]*$')) {
        return __('Name may contain only alphanumeric and _ . - characters');
      }

      return false;
    },
  };

  return (
    <div className="service-dialog-wrapper">
      <h2>{__('General')}</h2>
      <div>
        <MiqFormRenderer
          schema={createSchema()}
          validatorMapper={customValidatorMapper}
          showFormControls={false}
        />
      </div>
    </div>
  );
};

export default ServiceDialogWrapper;
