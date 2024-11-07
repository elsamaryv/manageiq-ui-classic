import React from 'react';
import PropTypes from 'prop-types';
import { DatePicker, FormLabel } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS } from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, overridableOptions, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/** Component to render a Field. */
const DynamicDatePicker = ({ dynamicFieldData: { section, field, fieldPosition }, onFieldAction }) => {
  const { tabId, sectionId } = section;
  const fieldActions = (event, type) => onFieldAction({
    event,
    fieldPosition,
    type,
  });

  const ordinaryDatePickerOptions = () => ([
    dynamicFields.defaultValue,
    dynamicFields.required,
    dynamicFields.readOnly,
    dynamicFields.visible,
    dynamicFields.validation,
    dynamicFields.validator,
    dynamicFields.fieldsToRefresh,
  ]);

  const dynamicDatePickerOptions = () => ([
    dynamicFields.entryPoint,
    dynamicFields.showRefresh,
    dynamicFields.loadOnInit,
    dynamicFields.required,
    dynamicFields.validation,
    dynamicFields.validator,
    dynamicFields.fieldsToRefresh,
  ]);

  const datePickerOptions = (dynamic) => ({
    name: fieldTab.options,
    fields: dynamic ? dynamicDatePickerOptions() : ordinaryDatePickerOptions(),
  });

  const datePickerEditFields = (dynamic) => {
    const tabs = [
      fieldInformation(),
      datePickerOptions(dynamic),
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
          Date Picker
        </FormLabel>
        <DatePicker
          id={`tab-${tabId}-section-${sectionId}-field-${fieldPosition}-date-picker`}
          name={`tab-${tabId}-section-${sectionId}-field-${fieldPosition}-date-picker`}
          datePickerType="single"
          value="default date picker value"
          title={__('Date Picker')}
          onChange={(event) => fieldActions(event, SD_ACTIONS.datePickerOnChange)}
        />
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        dynamicFieldAction={(action) => console.log(action)}
        fieldConfiguration={datePickerEditFields(false)}
      />
    </div>
  );
};

DynamicDatePicker.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicDatePicker;
