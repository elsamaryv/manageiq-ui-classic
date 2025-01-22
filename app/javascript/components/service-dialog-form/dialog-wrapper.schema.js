import { componentTypes } from '@@ddf';

export const createSchema = () => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      name: 'dialog_name',
      label: 'Dialog\'s name',
      className: 'dialog-name',
      validate: [{ type: 'required' }],
    },
    {
      component: componentTypes.TEXTAREA,
      name: 'dialog_description',
      label: __('Dialog\'s description'),
      maxLength: 128,
      className: 'dialog-description',
    },
  ],
});
