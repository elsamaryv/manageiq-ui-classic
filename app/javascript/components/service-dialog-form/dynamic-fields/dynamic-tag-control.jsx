import React from 'react';
import PropTypes from 'prop-types';
import { Select, SelectItem, FormLabel } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS } from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, overridableOptions, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/** Component to render a Field. */
const DynamicTagControl = ({ dynamicFieldData: { section, field, fieldPosition }, onFieldAction }) => {
  const { tabId, sectionId } = section;
  const fieldActions = (event, type) => onFieldAction({
    event,
    fieldPosition,
    type,
  });

  const ordinaryTagControlOptions = () => ([
    dynamicFields.required,
    dynamicFields.readOnly,
    dynamicFields.visible,
    // dynamicFields.category,
    dynamicFields.singleValue,
    dynamicFields.valueType,
    dynamicFields.sortBy,
    dynamicFields.sortOrder,
    dynamicFields.entries,
    dynamicFields.fieldsToRefresh,
  ]);

  const dynamicTagControlOptions = () => ([
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

  const TagControlOptions = (dynamic) => ({
    name: fieldTab.options,
    fields: dynamic ? dynamicTagControlOptions() : ordinaryTagControlOptions(),
  });

  const TagControlEditFields = (dynamic) => {
    const tabs = [
      fieldInformation(),
      TagControlOptions(dynamic),
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
          Tag Control
        </FormLabel>
        <Select
          id={`tab-${tabId}-section-${sectionId}-field-${fieldPosition}-tag-control`}
          labelText="Select an option"
          helperText="Optional helper text"
        >
          <SelectItem value="" text="" />
          <SelectItem value="option-1" text="Option 1" />
          <SelectItem value="option-2" text="Option 2" />
        </Select>
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        dynamicFieldAction={(action) => console.log(action, field)}
        fieldConfiguration={TagControlEditFields(false)}
      />
    </div>
  );
};

DynamicTagControl.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicTagControl;
