import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { DatePicker, DatePickerInput } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS } from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, overridableOptions, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/** Component to render a Field. */
const DynamicDatePicker = ({ dynamicFieldData: { section, field, fieldPosition }, onFieldAction }) => {
  const { tabId, sectionId } = section;

  const [inputValues, setInputValues] = useState({});
  const inputId = `tab-${tabId}-section-${sectionId}-field-${fieldPosition}-date-picker`;
  const editActionType = SD_ACTIONS.field.edit;

  const [fieldState, setFieldState] = useState({
    label: field.label || __('Datepicker'),
    name: field.name || inputId,
    visible: field.visible || true,
    value: field.defaultDatePickerValue || '',
  });

  // To reset tabs in Edit Modal based on 'dynamic' switch
  const resetEditModalTabs = (isDynamic) => {
    setFieldState((prevState) => ({ ...prevState, dynamic: isDynamic }));
  };

  const ordinaryDatePickerOptions = () => ([
    dynamicFields.required,
    dynamicFields.defaultDatePickerValue,
    dynamicFields.readOnly,
    dynamicFields.visible,
    dynamicFields.showPastDates,
    dynamicFields.fieldsToRefresh,
  ]);

  const dynamicDatePickerOptions = () => ([
    dynamicFields.entryPoint,
    dynamicFields.showRefresh,
    dynamicFields.showPastDates,
    dynamicFields.fieldsToRefresh,
    dynamicFields.required,
  ]);

  const fieldActions = (event, inputProps) => {
    const type = (event === SD_ACTIONS.field.delete) ? SD_ACTIONS.field.delete : editActionType;

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

  const handleFieldUpdate = (updatedFields) => {
    // date = updatedFields.value[0].toLocaleDateString('en-US');
    setFieldState((prevState) => ({ ...prevState, ...updatedFields }));
    // onFieldAction({ ...dynamicFieldData, field: { ...dynamicFieldData.field, ...updatedFields } });
    onFieldAction({ event: undefined, type: editActionType, fieldPosition, inputProps: { ...field, ...updatedFields } });
  };

  const datePickerOptions = () => ({
    name: fieldTab.options,
    fields: fieldState.dynamic ? dynamicDatePickerOptions() : ordinaryDatePickerOptions(),
  });

  const datePickerEditFields = () => {
    const tabs = [
      fieldInformation(),
      datePickerOptions(),
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
        <DatePicker
          datePickerType="single"
          dateFormat="m/d/Y"
          minDate={fieldState.showPastDates ? undefined : new Date().toLocaleDateString()}
          onChange={(selectedDates, dateStr) => handleFieldUpdate({ value: dateStr })}
        >
          <DatePickerInput
            datePickerType="single"
            id={inputId}
            labelText={fieldState.label}
            value={fieldState.value}
            placeholder="mm/dd/yyyy"
          />
        </DatePicker>
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        fieldProps={fieldState}
        updateFieldProps={handleFieldUpdate}
        dynamicFieldAction={(event, inputProps) => fieldActions(event, inputProps)}
        fieldConfiguration={datePickerEditFields()}
        dynamicToggleAction={(isDynamic) => resetEditModalTabs(isDynamic)}
      />
    </div>
  );
};

DynamicDatePicker.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicDatePicker;
