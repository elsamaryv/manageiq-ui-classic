import { componentTypes, validatorTypes } from '@@ddf';
import { IsRequired } from '@data-driven-forms/carbon-component-mapper';

const createSchema = (fqname) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      id: 'fqname',
      name: 'fqname',
      label: __('Fully Qualified Name'),
      initialValue: fqname,
      maxLength: 128,
      validate: [{ type: validatorTypes.REQUIRED }],
      isReadOnly: true, 
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'name',
      name: 'name',
      label: __('Name'),
      maxLength: 128,
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'display_name',
      name: 'display_name',
      label: __('Display Name'),
      maxLength: 128,
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'description',
      name: 'description',
      label: __('Description'),
      maxLength: 255,
    },
  ],
});

export default createSchema;
