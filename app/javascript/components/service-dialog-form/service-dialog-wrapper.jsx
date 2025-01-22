import React from 'react';
import MiqFormRenderer from '@@ddf';
import { createSchema } from './dialog-wrapper.schema';

/** Component to wrap the service dialog form */
const ServiceDialogWrapper = () => {
  const onCancel = (formValues, e) => {
    console.log(formValues);
    console.log(e);
  };

  const onSubmit = (formValues, e) => {
    console.log(formValues);
    console.log(e);
  };

  return (
    <div className="service-dialog-wrapper">
      <h2>{__('General')}</h2>
      <div>
        <MiqFormRenderer
          schema={createSchema()}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
};
export default ServiceDialogWrapper;
