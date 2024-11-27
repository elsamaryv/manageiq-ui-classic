import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Checkbox, FormLabel } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS } from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, overridableOptions, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/** Component to render a Field. */
const DynamicCheckbox = ({ dynamicFieldData: { section, field, fieldPosition }, onFieldAction }) => {
  const { tabId, sectionId } = section;
  // const fieldActions = (event, type) => onFieldAction({
  //   event,
  //   fieldPosition,
  //   type,
  // });

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

  const ordinaryCheckboxOptions = () => ([
    dynamicFields.defaultCheckboxValue,
    dynamicFields.required,
    dynamicFields.readOnly,
    dynamicFields.visible,
    dynamicFields.fieldsToRefresh,
  ]);
  
  const dynamicCheckboxOptions = () => ([
    dynamicFields.entryPoint,
    dynamicFields.showRefresh,
    dynamicFields.loadOnInit,
    dynamicFields.required,
    dynamicFields.protected,
    dynamicFields.valueType,
    dynamicFields.validation,
    dynamicFields.validator,
    dynamicFields.fieldsToRefresh,
    dynamicFields.multiselect,
  ]);

  const checkboxOptions = (dynamic) => ({
    name: fieldTab.options,
    fields: dynamic ? dynamicCheckboxOptions() : ordinaryCheckboxOptions(),
  });

  const checkboxEditFields = (dynamic) => {
    const tabs = [
      fieldInformation(),
      checkboxOptions(dynamic),
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
          {inputValues.labelText ? inputValues.labelText : 'Checkbox'}
        </FormLabel> */}
        <Checkbox
          id={`tab-${tabId}-section-${sectionId}-field-${fieldPosition}-checkbox`}
          name={`tab-${tabId}-section-${sectionId}-field-${fieldPosition}-checkbox`}
          labelText={__('Checkbox')}
          {...inputValues}
          // onChange={(event) => fieldActions(event, SD_ACTIONS.checkboxOnChange)}
        />
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        // dynamicFieldAction={(action) => console.log(action, field)}
        dynamicFieldAction={(event, inputProps) => fieldActions(event, inputProps)}
        fieldConfiguration={checkboxEditFields(false)}
      />
    </div>
  );
};

DynamicCheckbox.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicCheckbox;
