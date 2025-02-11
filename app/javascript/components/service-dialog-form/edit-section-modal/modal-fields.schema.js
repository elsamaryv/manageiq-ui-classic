import { componentTypes } from '@@ddf';

export const createSchema = () => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      name: 'section_name',
      label: 'Section Name',
      className: 'section-name',
      // validate: [{ type: 'customValidatorForNameField' }],
    },
    {
      component: componentTypes.TEXTAREA,
      name: 'section_description',
      label: __('Section description'),
      maxLength: 128,
      className: 'section-description',
    },
  ],
});
