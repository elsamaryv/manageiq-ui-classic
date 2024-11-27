import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TextArea, FormLabel } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS } from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, overridableOptions, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/** Component to render a Field. */
const DynamicTextArea = ({ dynamicFieldData: { section, field, fieldPosition }, onFieldAction }) => {
  const { tabId, sectionId } = section;

  const [inputValues, setInputValues] = useState({});

  const inputId = `tab-${tabId}-section-${sectionId}-field-${fieldPosition}-text-area`;

  const [fieldState, setFieldState] = useState({
    label: field.label || __('Text Area'),
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

  

  const ordinaryTextAreaOptions = () => ([
    dynamicFields.defaultValue,
    dynamicFields.required,
    dynamicFields.readOnly,
    dynamicFields.visible,
    dynamicFields.validation,
    dynamicFields.validator,
    dynamicFields.fieldsToRefresh,
  ]);

  const dynamicTextAreaOptions = () => ([
    dynamicFields.entryPoint,
    dynamicFields.showRefresh,
    dynamicFields.loadOnInit,
    dynamicFields.required,
    dynamicFields.validation,
    dynamicFields.validator,
    dynamicFields.fieldsToRefresh,
  ]);

  const textAreaOptions = (dynamic) => ({
    name: fieldTab.options,
    fields: dynamic ? dynamicTextAreaOptions() : ordinaryTextAreaOptions(),
  });

  const textAreaEditFields = (dynamic) => {
    const tabs = [
      fieldInformation(),
      textAreaOptions(dynamic),
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
        {/* <FormLabel>
          Text Area
        </FormLabel> */}
        {/* <TextArea
          id={inputId}
          labelText={__('Text Area')}
          // hideLabel
          // placeholder={__('Text Area')}
          placeholder={__('Default value')}
          name={inputId}
          // value="default text area value"
          // title={__('Text Area')}
          {...inputValues}
          // onChange={(event) => fieldActions(event, SD_ACTIONS.textAreaOnChange)}
        /> */}
        <TextArea
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
        dynamicFieldAction={(event, inputProps) => fieldActions(event, inputProps)}
        fieldConfiguration={textAreaEditFields(false)}
      /> */}
      <DynamicFieldActions
        componentId={field.componentId}
        fieldProps={fieldState}
        updateFieldProps={handleFieldUpdate}
        dynamicFieldAction={(event, inputProps) => fieldActions(event, inputProps)}
        fieldConfiguration={textAreaEditFields(false)}
      />
    </div>
  );
};

DynamicTextArea.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicTextArea;
