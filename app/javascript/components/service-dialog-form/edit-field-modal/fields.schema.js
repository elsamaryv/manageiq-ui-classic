import { componentTypes } from '@data-driven-forms/react-form-renderer';

export const textFieldComponent = (field) => ({
  component: componentTypes.TEXT_FIELD,
  label: field.label,
  maxLength: 128,
  id: field.name,
  name: field.name,
  // value: defaultValue,
  initialValue: field.initialValue,
});

export const textAreaComponent = (field) => ({
  component: componentTypes.TEXTAREA,
  id: field.name,
  name: field.name,
  label: field.label,
  rows: 10,
  // value: defaultValue,
});

export const switchComponent = (field) => ({
  component: componentTypes.SWITCH,
  id: field.name,
  name: field.name,
  label: field.label,
  maxLength: 50,
  // value: defaultValue,
});


const valueTypes = [
  { label: __('String'), value: 'String' },
  { label: __('Integer'), value: 'Integer' },
];

const assignProfiles = [
  { label: __('Copy of sample'), value: 'Copy of sample' },
  { label: __('default'), value: 'default' },
  { label: __('host default'), value: 'host default' },
  { label: __('host sample'), value: 'host sample' },
  { label: __('sample'), value: 'sample' },
];

const selectOptions = (type) => {
  switch (type) {
    case 'valueType':
      return valueTypes;
    default:
      return assignProfiles;
  }
};

export const selectComponent = (field) => ({
  component: componentTypes.SELECT,
  id: field.name,
  name: field.name,
  label: field.label,
  placeholder: __('<Choose>'),
  includeEmpty: true,
  options: selectOptions(field.name),
  // value: defaultValue,
});
