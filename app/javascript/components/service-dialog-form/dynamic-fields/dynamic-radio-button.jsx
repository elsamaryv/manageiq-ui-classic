import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { RadioButtonGroup, RadioButton } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS } from '../helper';
import { defaultDropdownValue as rbOptions } from '../edit-field-modal/fields.schema';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, overridableOptions, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/** Component to render a Field. */
const DynamicRadioButton = ({ dynamicFieldData: { section, field, fieldPosition }, onFieldAction }) => {
  const { tabId, sectionId } = section;

  const [inputValues, setInputValues] = useState({});

  const inputId = `tab-${tabId}-section-${sectionId}-field-${fieldPosition}-radio-button-group`;

  const [fieldState, setFieldState] = useState({
    label: field.label || __('Radio Button'),
    required: field.required || false,
    name: field.name || inputId,
    visible: field.visible || true,
    items: field.items || rbOptions,
    // items: field.entries || rbSelectOptions,
  });

  const handleFieldUpdate = (updatedFields) => {
    setFieldState((prevState) => ({ ...prevState, ...updatedFields }));
    // onFieldAction({ ...dynamicFieldData, field: { ...dynamicFieldData.field, ...updatedFields } });
  };

  const fieldActions = (event, inputProps) => {
    const type = (event === SD_ACTIONS.field.delete) ? SD_ACTIONS.field.delete : SD_ACTIONS.textAreaOnChange;
    // setFieldState((prevState) => ({ ...prevState, ...updatedFields }));

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

  const ordinaryRadioButtonOptions = () => ([
    dynamicFields.readOnly,
    dynamicFields.visible,
    dynamicFields.required,
    dynamicFields.defaultDropdownValue,
    dynamicFields.valueType,
    dynamicFields.sortBy,
    dynamicFields.sortOrder,
    dynamicFields.entries,
    dynamicFields.fieldsToRefresh,
  ]);

  const dynamicRadioButtonOptions = () => ([
    dynamicFields.entryPoint,
    dynamicFields.showRefresh,
    dynamicFields.loadOnInit,
    dynamicFields.required,
    dynamicFields.valueType,
    dynamicFields.fieldsToRefresh,
  ]);

  const radioButtonOptions = () => ({
    name: fieldTab.options,
    fields: fieldState.dynamic ? dynamicRadioButtonOptions() : ordinaryRadioButtonOptions(),
  });

  const radioButtonEditFields = () => {
    const tabs = [
      fieldInformation(),
      radioButtonOptions(),
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
        <RadioButtonGroup
          legendText="Radio Button group"
          name={fieldState.name}
          onChange={(selectedValue) => handleFieldUpdate({ defaultDropdownValue: selectedValue })}
          valueSelected={fieldState.defaultDropdownValue}
        >
          {rbOptions.map((option) => (
            <RadioButton
              key={option.id}
              id={`tab-${tabId}-section-${sectionId}-field-${fieldPosition}-radio-button-${option.id}`}
              labelText={__(option.text)}
              name={`tab-${tabId}-section-${sectionId}-field-${fieldPosition}-radio-button-${option.id}`}
              value={option.id}
            />
          ))}
        </RadioButtonGroup>
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        fieldProps={fieldState}
        updateFieldProps={handleFieldUpdate}
        dynamicFieldAction={(event, inputProps) => fieldActions(event, inputProps)}
        fieldConfiguration={radioButtonEditFields()}
        dynamicToggleAction={(isDynamic) => resetEditModalTabs(isDynamic)}
      />
    </div>
  );
};

DynamicRadioButton.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicRadioButton;
