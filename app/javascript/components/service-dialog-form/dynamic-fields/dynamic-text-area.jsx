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
  
  // const handleInputProps = (formValues) => {
  //   // setInputProps(formValues);
  //   setInputProps({
  //     ...inputProps,
  //     ...formValues,
  //   });
  // };

  

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
        <TextArea
          id={`tab-${tabId}-section-${sectionId}-field-${fieldPosition}-text-area`}
          labelText={__('Text Area')}
          // hideLabel
          // placeholder={__('Text Area')}
          placeholder={__('Default value')}
          name={`tab-${tabId}-section-${sectionId}-field-${fieldPosition}-text-area`}
          // value="default text area value"
          // title={__('Text Area')}
          {...inputValues}
          // onChange={(event) => fieldActions(event, SD_ACTIONS.textAreaOnChange)}
        />
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
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
