import { componentTypes } from '@data-driven-forms/react-form-renderer';

export const dynamicFields = {
  // category: { label: __('Category'), name: 'category', field: componentTypes.SELECT },
  defaultValue: { label: __('Default value'), name: 'defaultValue', field: componentTypes.TEXT_FIELD, initialValue: "xyz" },
  defaultCheckboxValue: { label: __('Default value'), name: 'checked', field: componentTypes.SWITCH },
  dynamic: { label: __('Dynamic'), name: 'dynamic', field: componentTypes.SWITCH },
  entries: { label: __('Entries'), name: 'entries', field: componentTypes.SELECT },
  entryPoint: { label: __('Entry point'), name: 'entryPoint', field: componentTypes.SELECT },
  fieldsToRefresh: { label: __('Fields to refresh'), name: 'fieldsToRefresh', field: componentTypes.SELECT },
  help: { label: __('Help'), name: 'helperText', field: componentTypes.TEXTAREA },
  label: { label: __('Label'), name: 'labelText', field: componentTypes.TEXT_FIELD },
  loadOnInit: { label: __('Load values on init'), name: 'loadOnInit', field: componentTypes.SWITCH },
  multiselect: { label: __('Multiselect'), name: 'multiselect', field: componentTypes.SWITCH },
  name: { label: __('Name'), name: 'name', field: componentTypes.TEXT_FIELD },
  protected: { label: __('Protected'), name: 'protected', field: componentTypes.SWITCH },
  reconfigurable: { label: __('Reconfigurable'), name: 'reconfigurable', field: componentTypes.SWITCH },
  required: { label: __('Required'), name: 'required', field: componentTypes.SWITCH },
  readOnly: { label: __('Read only'), name: 'readOnly', field: componentTypes.SWITCH },
  showRefresh: { label: __('Show refresh button'), name: 'showRefresh', field: componentTypes.SWITCH },
  sortBy: { label: __('Sort by'), name: 'sortBy', field: componentTypes.SELECT },
  sortOrder: { label: __('Sort order'), name: 'sortOrder', field: componentTypes.SELECT },
  showPastDates: { label: __('Show Past Dates'), name: 'showPastDates', field: componentTypes.SWITCH },
  singleValue: { label: __('Single value'), name: 'singleValue', field: componentTypes.SWITCH },
  visible: { label: __('Visible'), name: 'visible', field: componentTypes.SWITCH },
  valueType: { label: __('Value type'), name: 'valueType', field: componentTypes.SELECT },
  validation: { label: __('Validation'), name: 'validation', field: componentTypes.SWITCH },
  validator: { label: __('Validator'), name: 'validator', field: componentTypes.TEXT_FIELD },
};

export const fieldTab = {
  fieldInformation: __('Field Information'),
  options: __('Options'),
  advanced: __('Advanced'),
  overridableOptions: __('Overridable Options'),
};

export const fieldInformation = () => ({
  name: fieldTab.fieldInformation,
  fields: [
    dynamicFields.label,
    dynamicFields.name,
    dynamicFields.help,
    dynamicFields.dynamic, // not there for tag control.
  ],
});

export const advanced = () => ({
  name: fieldTab.advanced,
  fields: [dynamicFields.reconfigurable],
});

export const overridableOptions = () => ({
  name: fieldTab.overridableOptions,
  fields: [
    dynamicFields.readOnly,
    dynamicFields.visible,
    dynamicFields.defaultValue,
  ],
});
