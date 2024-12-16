import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TextInput } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS } from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, overridableOptions, fieldTab, dynamicFields,
} from './dynamic-field-configuration';
/** Component to render a Field. */
const DynamicTextInput = ({ dynamicFieldData: { section, field, fieldPosition }, onFieldAction }) => {
  const { tabId, sectionId } = section;
  const [inputValues, setInputValues] = useState({});
  const inputId = `tab-${tabId}-section-${sectionId}-field-${fieldPosition}-text-input`;

  const [fieldState, setFieldState] = useState({
    label: field.label || __('Text Box'),
    // placeholder: field.placeholder || '',
    // required: field.required || false,
    name: field.name || inputId,
    visible: field.visible || true,
    value: field.value || '',
    dynamic: field.dynamic || false,
  });

  const handleFieldUpdate = (updatedFields) => {
    debugger
    setFieldState((prevState) => ({ ...prevState, ...updatedFields }));
    // onFieldAction({ ...dynamicFieldData, field: { ...dynamicFieldData.field, ...updatedFields } });
  };

  const fieldActions = (event, inputProps, type = SD_ACTIONS.textAreaOnChange) => {
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

  const ordinaryTextBoxOptions = () => ([
    dynamicFields.defaultValue,
    dynamicFields.required,
    dynamicFields.protected,
    dynamicFields.readOnly,
    dynamicFields.visible,
    dynamicFields.valueType,
    dynamicFields.validation,
    dynamicFields.fieldsToRefresh,
  ]);

  const dynamicTextBoxOptions = () => ([
    dynamicFields.entryPoint,
    dynamicFields.showRefresh,
    dynamicFields.loadOnInit,
    dynamicFields.required,
    dynamicFields.protected,
    dynamicFields.valueType,
    dynamicFields.validation,
    dynamicFields.fieldsToRefresh,
  ]);

  const textboxOptions = () => ({
    name: fieldTab.options,
    fields: fieldState.dynamic ? dynamicTextBoxOptions() : ordinaryTextBoxOptions(),
  });

  const textBoxEditFields = () => {
    const tabs = [
      fieldInformation(),
      textboxOptions(),
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
        {/* <TextInput
          id={inputId}
          labelText={__('Text Box')}
          placeholder={__('Default value')}
          name={inputId}
          // title={__('Text Box')}
          {...inputValues}
          // onChange={(event) => fieldActions(event, SD_ACTIONS.textInputOnChange)}
        /> */}
        <TextInput
          id={inputId}
          name={fieldState.name}
          labelText={fieldState.label}
          helperText={fieldState.helperText}
          placeholder={__('Default value')}
          visible={fieldState.visible}
          value={fieldState.value}
          onChange={(e) => handleFieldUpdate({ value: e.target.value })}
        />
      </div>
      {/* <DynamicFieldActions
        componentId={field.componentId}
        // dynamicFieldAction={(action) => console.log(action, field)}
        dynamicFieldAction={(event, inputProps) => fieldActions(event, inputProps)}
        fieldConfiguration={textBoxEditFields(false)}
        // fieldProps={handleInputProps}
      /> */}
      <DynamicFieldActions
        componentId={field.componentId}
        fieldProps={fieldState}
        updateFieldProps={handleFieldUpdate}
        dynamicFieldAction={(event, inputProps) => fieldActions(event, inputProps)}
        fieldConfiguration={textBoxEditFields()}
        dynamicToggleAction={(isDynamic) => resetEditModalTabs(isDynamic)}
      />
    </div>
  );
};

DynamicTextInput.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicTextInput;
