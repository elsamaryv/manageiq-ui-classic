import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MultiSelect } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS } from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
// import { defaultDropdownValue as optionEntries } from '../edit-field-modal/fields.schema';
import {
  fieldInformation, advanced, overridableOptionsWithSort, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/** Component to render a Field. */
const DynamicMultiSelectDropdown = ({ dynamicFieldData: { section, field, fieldPosition }, onFieldAction }) => {
  const { tabId, sectionId } = section;

  const [inputValues, setInputValues] = useState({});

  const inputId = `tab-${tabId}-section-${sectionId}-field-${fieldPosition}-multiselect-dropdown`;

  const optionEntries = [
    // { value: 'option-0', description: 'Option 0' },
    // { value: 'option-1', description: 'Option 1' },

    { description: 'A', value: '1' },
    { description: 'B', value: '2' },
    { description: 'C', value: '3' },
    { description: 'D', value: '4' },
    { description: 'E', value: '5' },
  ];

  const [fieldState, setFieldState] = useState({
    label: field.label || __('Selection Dropdown'),
    required: field.required || false,
    name: field.name || inputId,
    visible: field.visible || true,
    items: field.entries || optionEntries,
    multiselect: field.multiselect || false,
    value: field.defaultValue || [],
  });

  const handleFieldUpdate = (updatedFields) => {
    setFieldState((prevState) => ({ ...prevState, ...updatedFields }));
    // onFieldAction({ ...dynamicFieldData, field: { ...dynamicFieldData.field, ...updatedFields } });
  };

  const fieldActions = (event, inputProps) => {
    const type = (event === SD_ACTIONS.field.delete) ? SD_ACTIONS.field.delete : SD_ACTIONS.textAreaOnChange;

    setInputValues({
      ...inputValues,
      ...inputProps,
    });

    onFieldAction({
      event,
      fieldPosition,
      type,
      inputProps,
    });
  };

  // To reset tabs in Edit Modal based on 'dynamic' switch
  const resetEditModalTabs = (isDynamic) => {
    setFieldState((prevState) => ({ ...prevState, dynamic: isDynamic }));
  };

  const ordinaryDropdownOptions = () => ([
    dynamicFields.readOnly,
    dynamicFields.visible,
    dynamicFields.required,
    dynamicFields.defaultDropdownValue,
    dynamicFields.valueType,
    dynamicFields.sortBy,
    dynamicFields.sortOrder,
    dynamicFields.multiselect,
    dynamicFields.entries,
    dynamicFields.fieldsToRefresh,
  ]);

  const dynamicDropdownOptions = () => ([
    // dynamicFields.entryPoint,
    dynamicFields.showRefresh,
    dynamicFields.loadOnInit,
    dynamicFields.required,
    dynamicFields.valueType,
    dynamicFields.multiselect,
    dynamicFields.fieldsToRefresh,
  ]);

  const DropdownOptions = () => ({
    name: fieldTab.options,
    fields: fieldState.dynamic ? dynamicDropdownOptions() : ordinaryDropdownOptions(),
  });

  const DropdownEditFields = () => {
    const tabs = [
      fieldInformation(),
      DropdownOptions(),
      advanced(),
    ];
    if (fieldState.dynamic) {
      tabs.push(overridableOptionsWithSort());
    }
    return tabs;
  };

  const isSelectionInvalid = () => {
    // If single-select mode
    if (!fieldState.multiselect) {
      return fieldState.value.length > 1;
    }
    // If multi-select mode
    return false;
  };

  // const sortedItems = () =>
  //   [...fieldState.items].sort((a, b) => {
  //     const sortBy = fieldState.sortBy || 'description';
  //     const sortOrder = fieldState.sortOrder || 'ascending';

  //     return sortOrder === 'ascending'
  //       ? a[sortBy].localeCompare(b[sortBy])
  //       : b[sortBy].localeCompare(a[sortBy]);
  //   });

  const sortedItems = () => {
    // Log original items for debugging
    console.log('Before Sorting:', fieldState.items);
  
    const sortedArray = [...fieldState.items].sort((a, b) => {
      const sortBy = fieldState.sortBy || 'description';
      const sortOrder = fieldState.sortOrder || 'ascending';
  
      // Log the comparison for debugging
      console.log('Comparing:', a[sortBy], 'and', b[sortBy]);
  
      // Ensure that both properties are strings
      const valueA = a[sortBy] ? a[sortBy].toString() : '';
      const valueB = b[sortBy] ? b[sortBy].toString() : '';
  
      return sortOrder === 'ascending'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });
  
    // Log sorted items for debugging
    console.log('After Sorting:', sortedArray);
  
    return sortedArray;
  };

  // const sortedItems = () =>
  //   [...fieldState.items].sort((a, b) => {
  //     const sortBy = fieldState.sortBy || 'description';
  //     const sortOrder = fieldState.sortOrder || 'ascending';

  //     return sortOrder === 'ascending'
  //       ? a[sortBy].localeCompare(b[sortBy])
  //       : b[sortBy].localeCompare(a[sortBy]);
  //   });

  const handleSelectionChange = ({ selectedItems }) => {
    setFieldState((prevState) => ({
      ...prevState,
      value: selectedItems,
    }));
  };

  return (
    <div className="dynamic-form-field">
      <div className="dynamic-form-field-item">
        <MultiSelect
          id={inputId}
          name={fieldState.name}
          label={fieldState.label}
          titleText="Multiselect dropdown title text"
          helperText="This is helper text"
          items={sortedItems()}
          itemToString={(item) => (item ? item.description : '')}
          value={fieldState.value}
          selectionFeedback="top-after-reopen"
          invalid={isSelectionInvalid()}
          invalidText="Please select only one item."
          onChange={handleSelectionChange}
        />
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        fieldProps={fieldState}
        updateFieldProps={handleFieldUpdate}
        dynamicFieldAction={(event, inputProps) => fieldActions(event, inputProps)}
        fieldConfiguration={DropdownEditFields()}
        dynamicToggleAction={(isDynamic) => resetEditModalTabs(isDynamic)}
      />
    </div>
  );
};

DynamicMultiSelectDropdown.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicMultiSelectDropdown;
