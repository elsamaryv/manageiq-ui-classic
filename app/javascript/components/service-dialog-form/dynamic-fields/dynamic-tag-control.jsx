import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Select, SelectItem } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS } from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, fieldTab, dynamicFields,
} from './dynamic-field-configuration';
import { tagControlCategories } from '../data';

/** Component to render a Field. */
const DynamicTagControl = ({ dynamicFieldData: { section, field, fieldPosition }, onFieldAction }) => {
  const { tabId, sectionId } = section;
  const [inputValues, setInputValues] = useState({});

  const inputId = `tab-${tabId}-section-${sectionId}-field-${fieldPosition}-tag-control`;

  const [fieldState, setFieldState] = useState({
    label: field.label || __('Tag Control'),
    name: field.name || inputId,
    visible: field.visible || true,
    categories: field.categories || [],
    subCategories: field.subCategories || [],
  });

  useEffect(() => {
    if (fieldState.categories.length === 0) {
      tagControlCategories().then((fetchedCategories) => {
        const formattedCategories = fetchedCategories.map((cat) => ({
          label: __(cat.description),
          value: cat.id,
          key: cat.id,
          data: {
            subCategories: cat.children.map((subCat) => ({
              id: subCat.id,
              label: __(subCat.description),
            })),
          },
        }));

        setFieldState((prevState) => ({
          ...prevState,
          categories: formattedCategories,
        }));
      });
    }
  }, [fieldState.categories.length]);

  const handleFieldUpdate = (updatedFields) => {
    setFieldState((prevState) => ({
      ...prevState,
      ...updatedFields, // update other fields
      categories: prevState.categories, // this is required to retain the options in the dropdown
    }));
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

  const fetchSubCategories = (categoryValue) => {
    const selectedCategory = fieldState.categories.find((cat) => cat.value === categoryValue);
    if (selectedCategory) {
      setFieldState((prevState) => ({
        ...prevState,
        subCategories: selectedCategory.data.subCategories,
      }));
    }
  };

  const ordinaryTagControlOptions = () => ([
    dynamicFields.required,
    dynamicFields.readOnly,
    dynamicFields.visible,
    dynamicFields.categories,
    dynamicFields.singleValue,
    dynamicFields.valueType,
    dynamicFields.sortBy,
    dynamicFields.sortOrder,
    dynamicFields.subCategories,
    dynamicFields.fieldsToRefresh,
  ]);

  const tagControlOptions = () => ({
    name: fieldTab.options,
    fields: ordinaryTagControlOptions(),
  });

  const tagControlEditFields = () => {
    // Removes dynamic switch from the list
    const fieldInfo = fieldInformation();
    fieldInfo.fields = fieldInfo.fields.filter((field) => field.name !== 'dynamic');

    const tabs = [
      fieldInfo,
      tagControlOptions(),
      advanced(),
    ];
    return tabs;
  };

  return (
    <div className="dynamic-form-field">
      <div className="dynamic-form-field-item">
        <Select
          id={fieldState.name}
          labelText={fieldState.label}
          helperText={fieldState.helperText}
        >
          {fieldState.subCategories.map((subcat) => (
            <SelectItem key={subcat.id} text={subcat.label} value={subcat.id} />
          ))}
        </Select>
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        fieldProps={fieldState}
        updateFieldProps={handleFieldUpdate}
        dynamicFieldAction={(event, inputProps) => fieldActions(event, inputProps)}
        fieldConfiguration={tagControlEditFields()}
        dynamicToggleAction={(isDynamic) => resetEditModalTabs(isDynamic)}
        fetchSubCategories={(category) => fetchSubCategories(category)}
      />
    </div>
  );
};

DynamicTagControl.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicTagControl;
