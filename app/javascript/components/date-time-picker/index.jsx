import React, { useState, useEffect } from 'react';
import {
  DatePicker,
  DatePickerInput,
  TimePicker,
  TimePickerSelect,
  SelectItem,
  FormLabel,
} from 'carbon-components-react';

export const CustomDateTimePicker = ({ label, value, onChange, showPastDates }) => {
    debugger
//   const [date, setDate] = useState(value?.date || '');
//   const [time, setTime] = useState(value?.time || '');
//   const [period, setPeriod] = useState(value?.period || 'AM');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [period, setPeriod] = useState('AM');
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    // Update the parent component whenever date, time, or period changes
    onChange({ date, time, period });
  }, [date, time, period]);

  const handleDateChange = (selectedDate) => {
    // setDate(selectedDate[0]?.toLocaleDateString());
  };

  const handleTimeChange = (e) => {
    // const timeValue = e.target.value;
    // // Basic validation for time format
    // const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]$/;
    // setIsValid(timeRegex.test(timeValue));
    // setTime(timeValue);
  };

  const handlePeriodChange = (e) => {
    // setPeriod(e.target.value);
  };

  return (
    <div className="dynamic-form-field-item">
      <FormLabel>{label}</FormLabel>
      <DatePicker
        datePickerType="single"
        onChange={handleDateChange}
        minDate={showPastDates ? undefined : new Date().toLocaleDateString()}
      >
        <DatePickerInput id="date-picker-single" placeholder="mm/dd/yyyy" />
      </DatePicker>
      <TimePicker
        id="time-picker"
        value={time}
        invalid={!isValid}
        invalidText="Enter a valid 12-hour time (e.g., 01:30)"
        onChange={handleTimeChange}
        placeholder="hh:mm"
      >
        <TimePickerSelect id="time-picker-select-1" onChange={handlePeriodChange}>
          <SelectItem value="AM" text="AM" />
          <SelectItem value="PM" text="PM" />
        </TimePickerSelect>
      </TimePicker>
    </div>
  );
};
