import React from 'react';
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
  const fieldActions = (event, type) => onFieldAction({
    event,
    fieldPosition,
    type,
  });

  const ordinaryDropdownOptions = () => ([
    dynamicFields.readOnly,
    dynamicFields.visible,
    dynamicFields.required,
    dynamicFields.defaultValue,
    dynamicFields.valueType,
    dynamicFields.sortBy,
    dynamicFields.sortOrder,
    dynamicFields.multiselect,
    dynamicFields.entries,
    dynamicFields.fieldsToRefresh,
  ]);
  
  const dynamicDropdownOptions = () => ([
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

  const DropdownOptions = (dynamic) => ({
    name: fieldTab.options,
    fields: dynamic ? dynamicDropdownOptions() : ordinaryDropdownOptions(),
  });

  const DropdownEditFields = (dynamic) => {
    const tabs = [
      fieldInformation(),
      DropdownOptions(dynamic),
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
          Dropdown
        </FormLabel>
          {/* <Dropdown
            id={`tab-${tabId}-section-${sectionId}-field-${fieldPosition}-dropdown`}
            name={`tab-${tabId}-section-${sectionId}-field-${fieldPosition}-dropdown`}
            titleText={__('Dropdown')}
            label=""
            onChange={(event) => fieldActions(event, SD_ACTIONS.dropdownOnChange)}
          /> */}
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        dynamicFieldAction={(action) => console.log(action, field)}
        fieldConfiguration={DropdownEditFields(false)}
      />
    </div>
  );
};

DynamicDropdown.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicDropdown;
