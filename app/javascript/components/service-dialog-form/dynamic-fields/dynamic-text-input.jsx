import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TextInput, FormLabel } from 'carbon-components-react';
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
    placeholder: field.placeholder || '',
    required: field.required || false,
    name: field.name || inputId,
    visible: field.visible || true,
    value: field.value || '',
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

  const ordinaryTextBoxOptions = () => ([
    dynamicFields.defaultValue,
    dynamicFields.required,
    dynamicFields.protected,
    dynamicFields.readOnly,
    dynamicFields.visible,
    dynamicFields.valueType,
    dynamicFields.validation,
    dynamicFields.validator,
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
    dynamicFields.validator,
    dynamicFields.fieldsToRefresh,
  ]);

  const textboxOptions = (dynamic) => ({
    name: fieldTab.options,
    fields: dynamic ? dynamicTextBoxOptions() : ordinaryTextBoxOptions(),
  });

  const textBoxEditFields = (dynamic) => {
    const tabs = [
      fieldInformation(),
      textboxOptions(dynamic),
      advanced(),
    ];
    if (dynamic) {
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
          placeholder={fieldState.placeholder}
          required={fieldState.required}
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
        fieldConfiguration={textBoxEditFields(false)}
      />
    </div>
  );
};

DynamicTextInput.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicTextInput;
