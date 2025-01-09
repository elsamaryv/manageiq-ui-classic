// import { componentTypes } from '@data-driven-forms/react-form-renderer';
import { componentTypes } from '../component-types';
// import { componentTypes } from '@@ddf';

export const textFieldComponent = (field) => ({
  component: componentTypes.TEXT_FIELD,
  label: field.label,
  maxLength: 128,
  id: field.name,
  name: field.name,
  ...(field.condition && { condition: field.condition }),
  ...(field.placeholder && { placeholder: field.placeholder }),
});

export const textAreaComponent = (field) => ({
  component: componentTypes.TEXTAREA,
  id: field.name,
  name: field.name,
  label: field.label,
  rows: 10,
  ...(field.condition && { condition: field.condition }),
  ...(field.placeholder && { placeholder: field.placeholder }),
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
  // className: 'field-array-item',
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      name: 'description',
      placeholder: 'Description',
      isRequired: true,
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'value',
      placeholder: 'Value',
      isRequired: true,
    },
  ],
});

// export const fieldArrayComponent = (field) => ({
//   component: componentTypes.FIELD_ARRAY,
//   name: field.name,
//   label: field.label,
//   id: field.name,
//   fields: [
//     // {
//     //   component: componentTypes.TEXT_FIELD,
//     //   name: 'id',
//     //   label: 'Option ID',
//     //   isRequired: true,
//     //   helperText: 'Unique ID for the option.',
//     // },
//     // {
//     //   component: componentTypes.TEXT_FIELD,
//     //   name: 'text',
//     //   label: 'Option Text',
//     //   isRequired: true,
//     //   helperText: 'The label to display for the option.',
//     // },

//     // {
//     //   component: componentTypes.TEXT_FIELD,
//     //   name: 'value',
//     //   label: 'Option Value',
//     //   isRequired: true,
//     //   helperText: 'Value for the option.',
//     // },

//     {
//       component: componentTypes.TEXT_FIELD,
//       name: 'description',
//       // label: 'Option Description',
//       placeholder: 'Description',
//       isRequired: true,
//       // helperText: 'Description',
//     },
//     {
//       component: componentTypes.TEXT_FIELD,
//       name: 'value',
//       // label: 'Option Value',
//       placeholder: 'Value',
//       isRequired: true,
//       // helperText: 'Value',
//     },
//   ],
// });

export const datePickerComponent = (field) => ({
  component: componentTypes.DATE_PICKER,
  id: field.name,
  name: field.name,
  label: field.label,
  value: field.value,
});

export const dateTimePickerComponent = (field) => ({
  component: componentTypes.DATE_TIME_PICKER,
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
  { label: __('Ascending'), value: 'ascending' },
  { label: __('Descending'), value: 'descending' },
];

const sortBy = [
  { label: __('Description'), value: 'description' },
  { label: __('Value'), value: 'value' },
];

const assignProfiles = [
  { label: __('Copy of sample'), value: 'Copy of sample' },
  { label: __('default'), value: 'default' },
  { label: __('host default'), value: 'host default' },
  { label: __('host sample'), value: 'host sample' },
  { label: __('sample'), value: 'sample' },
];

// export const defaultDropdownOptions = [

// { text: __('Option 0'), value: 'option-0', id: 'option-0' },
//   { text: __('Option 1'), value: 'option-1', id: 'option-1' },

//   { description: 'A', value: '1' },
//   { description: 'B', value: '2' },
//   { description: 'C', value: '3' },
//   { description: 'b', value: '4' },
//   { description: 'D', value: '5' },
// ];

export const defaultDropdownOptions = [
  { text: 'A', description: 'A', label: 'A', value: '1' },
  { text: 'B', description: 'B', label: 'B', value: '2' },
  { text: 'C', description: 'C', label: 'C', value: '3' },
  { text: 'b', description: 'b', label: 'b', value: '4' },
  { text: 'D', description: 'D', label: 'D', value: '5' },
];

const selectOptions = (field, initialData) => {
  switch (field.name) {
    case 'valueType':
      return valueTypes;
    case 'sortOrder':
      return sortOrder;
    case 'sortBy':
      return sortBy;
    case 'defaultDropdownValue':
      return initialData.items;
    case 'categories':
      return initialData.categories;
    case 'subCategories':
      return [];
    default:
      return assignProfiles;
  }
};

export const selectComponent = (field, initialData) => ({
  component: componentTypes.SELECT,
  id: field.name,
  name: field.name,
  label: field.label,
  placeholder: __('<Choose>'),
  // includeEmpty: true,
  options: selectOptions(field, initialData),
  ...(field.name === 'defaultDropdownValue' && initialData.multiselect && { isMulti: initialData.multiselect }),
});
