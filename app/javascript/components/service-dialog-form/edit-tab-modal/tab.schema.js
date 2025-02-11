import { componentTypes } from '@@ddf';

export const createSchema = () => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      name: 'tab_name',
      label: 'Tab Name',
      className: 'tab-name',
      // validate: [{ type: 'customValidatorForNameField' }],
    },
    {
      component: componentTypes.TEXTAREA,
      name: 'tab_description',
      label: __('Tab description'),
      maxLength: 128,
      className: 'tab-description',
    },
  ],
  });