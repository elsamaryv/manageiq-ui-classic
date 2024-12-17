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
  textInputOnChange: 'textInputOnChange',
  textAreaOnChange: 'textAreaOnChange',
  checkboxOnChange: 'checkboxOnChange',
  radioButtonOnChange: 'radioButtonOnChange',
  datePickerOnChange: 'datePickerOnChange',
  dropdownOnChange: 'dropdownOnChange',
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
  selectedValue: PropTypes.string,
  multiselect: PropTypes.bool,
});

const multiselectDropdownShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })
  ).isRequired,
  // selectedValue: PropTypes.string,
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

const datepickerShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
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
  multiselectDropdown: multiselectDropdownShape,
  radiobutton: radioButtonShape,
  datepicker: datepickerShape,
  tagControl: tagControlShape,
};
