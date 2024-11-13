import { componentTypes } from '@data-driven-forms/react-form-renderer';

export const dynamicFields = {
  category: { label: __('Category'), name: 'category', field: componentTypes.SELECT },
  defaultValue: { label: __('Default value'), name: 'default_value', field: componentTypes.TEXT_FIELD },
  defaultCheckboxValue: { label: __('Default value'), name: 'default_checkbox_value', field: componentTypes.SWITCH },
  dynamic: { label: __('Dynamic'), name: 'dynamic', field: componentTypes.SWITCH },
  entries: { label: __('Entries'), name: 'entries', field: componentTypes.SELECT },
  entryPoint: { label: __('Entry point'), name: 'entry_point', field: componentTypes.SELECT },
  fieldsToRefresh: { label: __('Fields to refresh'), name: 'fields_to_refresh', field: componentTypes.SELECT },
  help: { label: __('Help'), name: 'help', field: componentTypes.TEXTAREA },
  label: { label: __('Label'), name: 'label', field: componentTypes.TEXT_FIELD },
  loadOnInit: { label: __('Load values on init'), name: 'load_on_init', field: componentTypes.SWITCH },
  multiselect: { label: __('Multiselect'), name: 'multiselect', field: componentTypes.SWITCH },
  name: { label: __('Name'), name: 'name_val', field: componentTypes.TEXT_FIELD },
  protected: { label: __('Protected'), name: 'protected', field: componentTypes.SWITCH },
  reconfigurable: { label: __('Reconfigurable'), name: 'reconfigurable', field: componentTypes.SWITCH },
  required: { label: __('Required'), name: 'required_val', field: componentTypes.SWITCH },
  readOnly: { label: __('Read only'), name: 'read_only', field: componentTypes.SWITCH },
  showRefresh: { label: __('Show refresh button'), name: 'show_refresh', field: componentTypes.SWITCH },
  sortBy: { label: __('Sort by'), name: 'sort_by', field: componentTypes.SELECT },
  sortOrder: { label: __('Sort order'), name: 'sort_order', field: componentTypes.SELECT },
  showPastDates: { label: __('Show Past Dates'), name: 'show_past_dates', field: componentTypes.SWITCH },
  singleValue: { label: __('Single value'), name: 'single_val', field: componentTypes.SWITCH },
  visible: { label: __('Visible'), name: 'visible_val', field: componentTypes.SWITCH },
  valueType: { label: __('Value type'), name: 'value_type', field: componentTypes.SELECT },
  validation: { label: __('Validation'), name: 'validation_val', field: componentTypes.SWITCH },
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
