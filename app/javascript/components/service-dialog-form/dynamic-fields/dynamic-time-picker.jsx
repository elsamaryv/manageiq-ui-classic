import React, { useState } from 'react';
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

  const [inputValues, setInputValues] = useState({});

  // const fieldActions = (event, type) => onFieldAction({
  //   event,
  //   fieldPosition,
  //   type,
  // });

  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');

  const handleDateChange = (selectedDates) => {
    if (selectedDates.length > 0) {
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }).format(selectedDates[0]);
      setDate(formattedDate);
    }
  };

  const handleTimeChange = (event) => {
    setTime(event.target.value); // Capture time or AM/PM selection
  };

  const combinedDateTime = `${date} ${time}`;
  console.log('Selected DateTime:', combinedDateTime);

  const [fieldState, setFieldState] = useState({
    label: field.label || __('Timepicker'),
    name: field.name,
    visible: field.visible || true,
    // value: field.defaultDatePickerValue || '',
  });

  const handleFieldUpdate = (updatedFields) => {
    // date = updatedFields.value[0].toLocaleDateString('en-US');
    setFieldState((prevState) => ({ ...prevState, ...updatedFields }));
    // onFieldAction({ ...dynamicFieldData, field: { ...dynamicFieldData.field, ...updatedFields } });
  };

  const fieldActions = (event, inputProps) => {
    const type = (event === SD_ACTIONS.field.delete) ? SD_ACTIONS.field.delete : SD_ACTIONS.textAreaOnChange;

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

  // To reset tabs in Edit Modal based on 'dynamic' switch
  const resetEditModalTabs = (isDynamic) => {
    setFieldState((prevState) => ({ ...prevState, dynamic: isDynamic }));
  };

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
    dynamicFields.showPastDates,
    dynamicFields.fieldsToRefresh,
    dynamicFields.required,
  ]);

  const timePickerOptions = () => ({
    name: fieldTab.options,
    fields: fieldState.dynamic ? dynamicTimePickerOptions() : ordinaryTimePickerOptions(),
  });

  const timePickerEditFields = () => {
    const tabs = [
      fieldInformation(),
      timePickerOptions(),
      advanced(),
    ];
    if (fieldState.dynamic) {
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
          onChange={handleDateChange}
        >
          <DatePickerInput
            id="date-picker-single"
            labelText="Date Picker label"
            placeholder="mm/dd/yyyy"
          />
        </DatePicker>

        <TimePicker id="time-picker" labelText="Select a time">
          <TimePickerSelect id="time-picker-select-1" onChange={handleTimeChange}>
            <SelectItem value="AM" text="AM" />
            <SelectItem value="PM" text="PM" />
          </TimePickerSelect>
        </TimePicker>
      </div>
      {/* <DynamicFieldActions
        componentId={field.componentId}
        dynamicFieldAction={(action) => console.log(action)}
        fieldConfiguration={timePickerEditFields(false)}
      /> */}
      <DynamicFieldActions
        componentId={field.componentId}
        fieldProps={fieldState}
        updateFieldProps={handleFieldUpdate}
        dynamicFieldAction={(event, inputProps) => fieldActions(event, inputProps)}
        fieldConfiguration={timePickerEditFields()}
        dynamicToggleAction={(isDynamic) => resetEditModalTabs(isDynamic)}
      />
    </div>
  );
};

DynamicTimePicker.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicTimePicker;
