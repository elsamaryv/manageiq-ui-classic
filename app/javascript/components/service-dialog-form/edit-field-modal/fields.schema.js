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

const defaultDropdownValue = [
  // { id: 'option-0', text: 'Option 0' },
  // { id: 'option-1', text: 'Option 1' },
  { label: __('Option 0'), value: 'option-0' },
  { label: __('Option 1'), value: 'option-1' },
];

const selectOptions = (type) => {
  switch (type) {
    case 'valueType':
      return valueTypes;
    case 'sortOrder':
      return sortOrder;
    case 'sortBy':
      return sortBy;
    case 'defaultDropdownValue':
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
  options: selectOptions(field.name),
  // multiselect: field.multiselect,
  // value: field.value,
});
