import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, FormLabel } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS } from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, overridableOptions, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/** Component to render a Field. */
const DynamicCheckbox = ({ dynamicFieldData: { section, field, fieldPosition }, onFieldAction }) => {
  debugger
  const { tabId, sectionId } = section;
  const fieldActions = (event, type) => onFieldAction({
    event,
    fieldPosition,
    type,
  });

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
        <FormLabel>
          Checkbox
        </FormLabel>
          <Checkbox
            id={`tab-${tabId}-section-${sectionId}-field-${fieldPosition}-checkbox`}
            name={`tab-${tabId}-section-${sectionId}-field-${fieldPosition}-checkbox`}
            labelText={__('Checkbox')}
            // orientation='horizontal'
            onChange={(event) => fieldActions(event, SD_ACTIONS.checkboxOnchange)}
          />
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        dynamicFieldAction={(action) => console.log(action, field)}
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
