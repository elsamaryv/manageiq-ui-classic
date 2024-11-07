import React from 'react';
import PropTypes from 'prop-types';
import { RadioButtonGroup, RadioButton, FormLabel } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS } from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, overridableOptions, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/** Component to render a Field. */
const DynamicRadioButton = ({ dynamicFieldData: { section, field, fieldPosition }, onFieldAction }) => {
  const { tabId, sectionId } = section;
  const fieldActions = (event, type) => onFieldAction({
    event,
    fieldPosition,
    type,
  });

  const ordinaryRadioButtonOptions = () => ([
    dynamicFields.readOnly,
    dynamicFields.visible,
    dynamicFields.required,
    dynamicFields.defaultValue,
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
    dynamicFields.validation,
    dynamicFields.validator,
    dynamicFields.fieldsToRefresh,
  ]);

  const radioButtonOptions = (dynamic) => ({
    name: fieldTab.options,
    fields: dynamic ? dynamicRadioButtonOptions() : ordinaryRadioButtonOptions(),
  });

  const radioButtonEditFields = (dynamic) => {
    const tabs = [
      fieldInformation(),
      radioButtonOptions(dynamic),
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
          Radio Button
        </FormLabel> */}
        <RadioButtonGroup
          legendText="Radio Button group"
          name={`tab-${tabId}-section-${sectionId}-field-${fieldPosition}-radio-button-group`}
        >
          <RadioButton
            id={`tab-${tabId}-section-${sectionId}-field-${fieldPosition}-radio-button-1`}
            labelText={__('Radio Button 1')}
            name={`tab-${tabId}-section-${sectionId}-field-${fieldPosition}-radio-button-1`}
            value="default radio button value"
            onChange={(event) => fieldActions(event, SD_ACTIONS.radioButtonOnchange)}
          />
          <RadioButton
            id={`tab-${tabId}-section-${sectionId}-field-${fieldPosition}-radio-button-2`}
            labelText={__('Radio Button 2')}
            name={`tab-${tabId}-section-${sectionId}-field-${fieldPosition}-radio-button-2`}
            value="default radio button value"
            onChange={(event) => fieldActions(event, SD_ACTIONS.radioButtonOnchange)}
          />
        </RadioButtonGroup>
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        dynamicFieldAction={(action) => console.log(action)}
        fieldConfiguration={radioButtonEditFields(false)}
      />
    </div>
  );
};

DynamicRadioButton.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicRadioButton;
