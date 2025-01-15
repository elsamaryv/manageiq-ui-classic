import React from 'react';
import {
  DatePicker,
  DatePickerInput,
  TimePicker,
  TimePickerSelect,
  SelectItem,
  FormLabel,
} from 'carbon-components-react';

const CustomDateTimePicker = (field) => {
  debugger
  const { initialData } = field;
  
  return (
    <div>
      <FormLabel>{field.label}</FormLabel>
      <DatePicker
        datePickerType="single"
      >
        <DatePickerInput
          id="date-picker-single"
          placeholder="mm/dd/yyyy"
          labelText={__('Select Date')}
          value={initialData.date}
          hideLabel
        />
        <TimePicker
          id="time-picker"
          placeholder="hh:mm"
          labelText={__('Select Time')}
          hideLabel
          value={initialData.time}
        >
          <TimePickerSelect id="time-picker-select-1" labelText={__('Select Period')} defaultValue={initialData.period}>
            <SelectItem value="AM" text="AM" />
            <SelectItem value="PM" text="PM" />
          </TimePickerSelect>
        </TimePicker>
      </DatePicker>
    </div>
  );
};

export default CustomDateTimePicker;
