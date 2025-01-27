import PropTypes from 'prop-types';

export const dynamicFieldDataProps = PropTypes.shape({
  section: PropTypes.shape({
    tabId: PropTypes.number.isRequired,
    sectionId: PropTypes.number.isRequired,
    fields: PropTypes.arrayOf(PropTypes.any).isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  field: PropTypes.shape({ componentId: PropTypes.number }).isRequired,
  fieldPosition: PropTypes.number.isRequired,
});

export const selectedTab = (tabs, tabId) => tabs.find((tab) => tab.tabId === tabId);

export const SD_ACTIONS = {
  tab: {
    edit: 'tabEdit',
    delete: 'tabDelete',
  },
  section: {
    edit: 'sectionEdit',
    delete: 'sectionDelete',
  },
  field: {
    edit: 'fieldEdit',
    delete: 'fieldDelete',
  },
  onDragOverListener: 'onDragOverListener',
  onDrop: 'onDrop',
  onDragEnterSection: 'onDragEnterSection',
  onDragEnterField: 'onDragEnterField',
  onDragStartField: 'onDragStartField',
  onDragStartSection: 'onDragStartSection',
};

/** Function to drop a field after its been dragged within a section */
// TODO: The first section cannot be dropped to the last index. need to debug.
export const dropField = (section, { sectionId, fieldPosition }, dragEnterItem) => {
  if (section.sectionId === sectionId) {
    // makes sure that the dragged field stays in the same section.
    const draggedField = section.fields.find((_field, index) => index === fieldPosition);
    const otherFields = section.fields.filter((_field, index) => index !== fieldPosition);
    otherFields.splice(dragEnterItem.fieldPosition, 0, draggedField);
    section.fields = otherFields;
  }
};

/** Function to drop a section after its been dragged */
export const dropSection = (tab, { sectionId }, dragEnterItem) => {
  const draggedSection = tab.sections.find((section) => section.sectionId === sectionId);
  const otherSections = tab.sections.filter((section) => section.sectionId !== sectionId);
  otherSections.splice(dragEnterItem.sectionId, 0, draggedSection);
  tab.sections = otherSections;
};

/** Function to drop a component after its been dragged */
export const dropComponent = (section, { componentId }) => {
  section.fields.push({ componentId });
};

// Shapes for each service dialog components as needed
const textInputShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
});

const textAreaShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  value: PropTypes.string,
});

const checkboxShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  required: PropTypes.bool,
});

const dropdownShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })
  ).isRequired,
  // multiselect: PropTypes.bool,
});

const radioButtonShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
  // items: PropTypes.arrayOf(
  //   PropTypes.shape({
  //     id: PropTypes.string.isRequired,
  //     text: PropTypes.string.isRequired,
  //   })
  // ).isRequired,
  // selectedValue: PropTypes.string,
});

const datePickerShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
});

const dateTimePickerShape = PropTypes.shape({
  label: PropTypes.string,
  value: PropTypes.string,
});

const tagControlShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
});

export const SD_PROP_SHAPES = {
  textbox: textInputShape,
  textarea: textAreaShape,
  checkbox: checkboxShape,
  dropdown: dropdownShape,
  radiobutton: radioButtonShape,
  datePicker: datePickerShape,
  dateTimePicker: dateTimePickerShape,
  tagControl: tagControlShape,
};

// const sampleCreatePayload = () => (

//   {
//     "action": "create",
//     "resource": {
//       "label": "A11",
//       "buttons": "submit,cancel",
//       "dialog_tabs": [
//         {
//           "label": "New tab",
//           "position": 0,
//           "dialog_groups": [
//             {
//               "label": "New section",
//               "position": 0,
//               "dialog_fields": [
//                 {
//                   "name": "text_box_1_1",
//                   "description": "",
//                   "type": "DialogFieldTextBox",
//                   "display": "edit",
//                   "display_method_options": {},
//                   "read_only": false,
//                   "required": false,
//                   "required_method_options": {},
//                   "default_value": "v1",
//                   "values_method_options": {},
//                   "label": "Text Box",
//                   "position": 0,
//                   "dynamic": false,
//                   "show_refresh_button": false,
//                   "load_values_on_init": true,
//                   "auto_refresh": false,
//                   "trigger_auto_refresh": false,
//                   "reconfigurable": false,
//                   "visible": true,
//                   "options": {
//                     "protected": false
//                   },
//                   "resource_action": {
//                     "resource_type": "DialogField",
//                     "ae_attributes": {}
//                   },
//                   "validator_type": false
//                 },
//                 {
//                   "name": "dropdown_list_1",
//                   "description": "",
//                   "type": "DialogFieldDropDownList",
//                   "display": "edit",
//                   "display_method_options": {},
//                   "read_only": false,
//                   "required": false,
//                   "required_method_options": {},
//                   "default_value": "3",
//                   "values_method_options": {},
//                   "label": "Dropdown",
//                   "position": 1,
//                   "dynamic": false,
//                   "show_refresh_button": false,
//                   "load_values_on_init": true,
//                   "auto_refresh": false,
//                   "trigger_auto_refresh": false,
//                   "reconfigurable": false,
//                   "visible": true,
//                   "options": {
//                     "sort_by": "description",
//                     "sort_order": "ascending",
//                     "force_multi_value": false
//                   },
//                   "resource_action": {
//                     "resource_type": "DialogField",
//                     "ae_attributes": {}
//                   },
//                   "data_type": "string",
//                   "values": [
//                     [
//                       "1",
//                       "One"
//                     ],
//                     [
//                       "2",
//                       "Two"
//                     ],
//                     [
//                       "3",
//                       "Three"
//                     ]
//                   ]
//                 },
//                 {
//                   "name": "radio_button_1",
//                   "description": "",
//                   "type": "DialogFieldRadioButton",
//                   "display": "edit",
//                   "display_method_options": {},
//                   "read_only": false,
//                   "required": false,
//                   "required_method_options": {},
//                   "default_value": "3",
//                   "values_method_options": {},
//                   "label": "Radio Button",
//                   "position": 2,
//                   "dynamic": false,
//                   "show_refresh_button": false,
//                   "load_values_on_init": true,
//                   "auto_refresh": false,
//                   "trigger_auto_refresh": false,
//                   "reconfigurable": false,
//                   "visible": true,
//                   "options": {
//                     "sort_by": "description",
//                     "sort_order": "ascending"
//                   },
//                   "resource_action": {
//                     "resource_type": "DialogField",
//                     "ae_attributes": {}
//                   },
//                   "data_type": "string",
//                   "values": [
//                     [
//                       "1",
//                       "One"
//                     ],
//                     [
//                       "2",
//                       "Two"
//                     ],
//                     [
//                       "3",
//                       "Three",
//                     ]
//                   ]
//                 }
//               ]
//             }
//           ]
//         }
//       ]
//     }
// });

// get details on the different fields in the catalog form
// to do: loops over each of the fields in the section first ----
// const getFieldsInfo = (fields) => {
//   fields.map((field) => ({

//   }));
// };

const getFieldsInfo = (fields) =>
  fields.map(({ componentId: _componentId, ...rest }) => rest);

// get details on Sections
const getSectionsInfo = (sections) => {
  // debugger
  console.log('Sections::: ', sections);
  return sections.map((section) => ({
    label: section.title,
    position: section.order,
    // dialog_fields: getFieldsInfo(section.fields),
    // dialog_fields: section.fields,
    // dialog_fields: section.fields.map(({ componentID, ...rest }) => rest),
    dialog_fields: getFieldsInfo(section.fields),
  }));
};

// get details on tabs
const getTabsInfo = (tabs) => {
  console.log("Tabs::: ", tabs);
  return tabs.map((tab) => ({
    label: tab.name,
    position: tab.tabId,
    dialog_groups: getSectionsInfo(tab.sections),
  }));
};

// get details on the dialog
const getDialogInfo = (data) => {
  // debugger
  return ({
    label: data.dialog && data.dialog.label,
    buttons: 'submit,cancel',
    dialog_tabs: getTabsInfo(data.formFields),
  });
};

// get payload for create
const payloadForCreate = (data) => {
  // debugger

  return ({
    action: 'create',
    resource: getDialogInfo(data),
  });
};

export const formattedCatalogPayload = (data) => {
  // return sampleCreatePayload();
  const payload = payloadForCreate(data);
  debugger
  return payload;
};
