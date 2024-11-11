import React from 'react';
import PropTypes from 'prop-types';
import {
	DatePicker, DatePickerInput, TimePicker, TimePickerSelect, SelectItem, FormLabel
} from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS } from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, overridableOptions, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/** Component to render a Field. */
const DynamicTimePicker = ({ dynamicFieldData: { section, field, fieldPosition }, onFieldAction }) => {
  const { tabId, sectionId } = section;
  const fieldActions = (event, type) => onFieldAction({
    event,
    fieldPosition,
    type,
  });

  const ordinaryTimePickerOptions = () => ([
    dynamicFields.required,
    dynamicFields.defaultValue,
    dynamicFields.readOnly,
    dynamicFields.visible,
    dynamicFields.showPastDates,
    dynamicFields.fieldsToRefresh,
  ]);

  const dynamicTimePickerOptions = () => ([
    dynamicFields.entryPoint,
    dynamicFields.showRefresh,
    dynamicFields.loadOnInit,
    dynamicFields.required,
    dynamicFields.validation,
    dynamicFields.validator,
    dynamicFields.fieldsToRefresh,
  ]);

  const timePickerOptions = (dynamic) => ({
    name: fieldTab.options,
    fields: dynamic ? dynamicTimePickerOptions() : ordinaryTimePickerOptions(),
  });

  const timePickerEditFields = (dynamic) => {
    const tabs = [
      fieldInformation(),
      timePickerOptions(dynamic),
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
          Date Picker
        </FormLabel> */}
        <DatePicker
          datePickerType="single"
          onChange={() => {}}
          onClose={() => {}}
          onOpen={() => {}}
        >
          <DatePickerInput
            id="date-picker-single"
            labelText="Date Picker label"
            onChange={() => {}}
            onClose={() => {}}
            onOpen={() => {}}
            placeholder="mm/dd/yyyy"
          />
        </DatePicker>
        <TimePicker id="time-picker" labelText="Select a time">
          <TimePickerSelect id="time-picker-select-1">
            <SelectItem value="AM" text="AM" />
            <SelectItem value="PM" text="PM" />
          </TimePickerSelect>
        </TimePicker>
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        dynamicFieldAction={(action) => console.log(action)}
        fieldConfiguration={timePickerEditFields(false)}
      />
    </div>
  );
};

DynamicTimePicker.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicTimePicker;
