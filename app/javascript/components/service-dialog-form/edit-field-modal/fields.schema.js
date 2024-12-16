import { componentTypes } from '@data-driven-forms/react-form-renderer';

export const textFieldComponent = (field) => ({
  component: componentTypes.TEXT_FIELD,
  label: field.label,
  maxLength: 128,
  id: field.name,
  name: field.name,
  initialValue: field.initialValue,
});

export const textAreaComponent = (field) => ({
  component: componentTypes.TEXTAREA,
  id: field.name,
  name: field.name,
  label: field.label,
  rows: 10,
});

export const switchComponent = (field) => ({
  component: componentTypes.SWITCH,
  id: field.name,
  name: field.name,
  label: field.label,
  maxLength: 50,
});

export const fieldArrayComponent = (field) => ({
  component: componentTypes.FIELD_ARRAY,
  name: field.name,
  label: field.label,
  id: field.name,
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      name: 'id',
      label: 'Option ID',
      isRequired: true,
      helperText: 'Unique ID for the option.',
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'text',
      label: 'Option Text',
      isRequired: true,
      helperText: 'The label to display for the option.',
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'value',
      label: 'Option Value',
      isRequired: true,
      helperText: 'Value for the option.',
    },
  ],
});

export const datePickerComponent = (field) => ({
  component: componentTypes.DATE_PICKER,
  id: field.name,
  name: field.name,
  label: field.label,
  value: field.value,
});

const valueTypes = [
  { label: __('String'), value: 'String' },
  { label: __('Integer'), value: 'Integer' },
];

const sortOrder = [
  { label: __('Ascending'), value: 'Ascending' },
  { label: __('Descending'), value: 'Descending' },
];

const sortBy = [
  { label: __('None'), value: 'None' },
  { label: __('Description'), value: 'Description' },
  { label: __('Value'), value: 'Value' },
];

const assignProfiles = [
  { label: __('Copy of sample'), value: 'Copy of sample' },
  { label: __('default'), value: 'default' },
  { label: __('host default'), value: 'host default' },
  { label: __('host sample'), value: 'host sample' },
  { label: __('sample'), value: 'sample' },
];

export const defaultDropdownValue = [
  { text: __('Option 00'), value: 'option-0', id: 'option-0' },
  { text: __('Option 1'), value: 'option-1', id: 'option-1' },
];

const selectOptions = (field) => {
  switch (field.name) {
    case 'valueType':
      return valueTypes;
    case 'sortOrder':
      return sortOrder;
    case 'sortBy':
      return sortBy;
    case 'defaultDropdownValue':
      debugger
      return defaultDropdownValue;
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
  options: selectOptions(field),
  // initialValue: field.initialValue,
  // multiselect: field.multiselect,
  // value: field.value,
});
