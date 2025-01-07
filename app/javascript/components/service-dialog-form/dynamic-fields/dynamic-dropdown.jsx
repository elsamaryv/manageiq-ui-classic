import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, FormLabel } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS } from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, overridableOptionsWithSort, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/** Component to render a Field. */
const DynamicDropdown = ({ dynamicFieldData: { section, field, fieldPosition }, onFieldAction }) => {
  const { tabId, sectionId } = section;
  const [inputValues, setInputValues] = useState({});

  const inputId = `tab-${tabId}-section-${sectionId}-field-${fieldPosition}-dropdown`;

  const optionEntries = [
    // { value: 'option-0', description: 'Option 0' },
    // { value: 'option-1', description: 'Option 1' },

    { value: '1', description: 'A' },
    { value: '2', description: 'B' },
    { value: '3', description: 'C' },
    { value: '4', description: 'D' },
    { value: '5', description: 'E' },
  ];

  const [fieldState, setFieldState] = useState({
    label: field.label || __('Dropdown'),
    required: field.required || false,
    name: field.name || inputId,
    visible: field.visible || true,
    items: field.entries || optionEntries,
    value: field.defaultValue || '',
    multiselect: field.multiselect || false,
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

  const sortedItems = () =>
    [...fieldState.items].sort((a, b) => {
      const sortBy = fieldState.sortBy || 'description';
      const sortOrder = fieldState.sortOrder || 'ascending';

      return sortOrder === 'ascending'
        ? a[sortBy].localeCompare(b[sortBy])
        : b[sortBy].localeCompare(a[sortBy]);
    });

  return (
    <div className="dynamic-form-field">
      <div className="dynamic-form-field-item">
        {/* <FormLabel>
          Dropdown
        </FormLabel> */}
        <Dropdown
          id={inputId}
          name={fieldState.name}
          // titleText={__(inputValues.labelText || 'Dropdown')}
          titleText={fieldState.label}
          items={sortedItems()}
          itemToString={(item) => (item ? item.description : '')}
          value={fieldState.value}
          selectedItem={fieldState.items.find((item) => item.value === fieldState.value) || null}
          onChange={({ selectedItem }) => {
            handleFieldUpdate({ value: selectedItem.value });
          }}
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

DynamicDropdown.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicDropdown;
