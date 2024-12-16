import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Select, SelectItem, FormLabel } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS } from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/** Component to render a Field. */
const DynamicTagControl = ({ dynamicFieldData: { section, field, fieldPosition }, onFieldAction }) => {
  const { tabId, sectionId } = section;
  const [inputValues, setInputValues] = useState({});

  const [fieldState, setFieldState] = useState({
    label: field.label || __('Tag Control'),
    name: field.name,
    visible: field.visible || true,
  });

  const handleFieldUpdate = (updatedFields) => {
    debugger
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


  // const fieldActions = (event, type) => onFieldAction({
  //   event,
  //   fieldPosition,
  //   type,
  // });

  // To reset tabs in Edit Modal based on 'dynamic' switch
  const resetEditModalTabs = (isDynamic) => {
    setFieldState((prevState) => ({ ...prevState, dynamic: isDynamic }));
  };

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

  const TagControlOptions = () => ({
    name: fieldTab.options,
    fields: ordinaryTagControlOptions(),
  });

  const TagControlEditFields = () => {
    const tabs = [
      fieldInformation(),
      TagControlOptions,
      advanced(),
    ];
    return tabs;
  };

  return (
    <div className="dynamic-form-field">
      <div className="dynamic-form-field-item">
        {/* <FormLabel>
          Tag Control
        </FormLabel> */}
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
      {/* <DynamicFieldActions
        componentId={field.componentId}
        dynamicFieldAction={(action) => console.log(action, field)}
        fieldConfiguration={TagControlEditFields()}
        dynamicToggleAction={(isDynamic) => resetEditModalTabs(isDynamic)}
      /> */}
      <DynamicFieldActions
        componentId={field.componentId}
        fieldProps={fieldState}
        updateFieldProps={handleFieldUpdate}
        dynamicFieldAction={(event, inputProps) => fieldActions(event, inputProps)}
        fieldConfiguration={TagControlEditFields()}
        dynamicToggleAction={(isDynamic) => resetEditModalTabs(isDynamic)}
      />
    </div>
  );
};

DynamicTagControl.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicTagControl;
