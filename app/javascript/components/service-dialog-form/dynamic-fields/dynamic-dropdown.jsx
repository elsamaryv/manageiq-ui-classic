import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, FormLabel } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS } from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, overridableOptions, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/** Component to render a Field. */
const DynamicDropdown = ({ dynamicFieldData: { section, field, fieldPosition }, onFieldAction }) => {
  const { tabId, sectionId } = section;
  const [inputValues, setInputValues] = useState({});

  const inputId = `tab-${tabId}-section-${sectionId}-field-${fieldPosition}-dropdown`;

  const optionEntries = [
    { id: 'option-0', text: 'Option 0' },
    { id: 'option-1', text: 'Option 1' },
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
      tabs.push(overridableOptions());
    }
    return tabs;
  };

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
          items={fieldState.items}
          itemToString={(item) => (item ? item.text : '')}
          value={fieldState.value}
          selectedItem={fieldState.items.find((item) => item.id === fieldState.value) || null}
          onChange={({ selectedItem }) => {
            handleFieldUpdate({ value: selectedItem.id });
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
