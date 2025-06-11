import { componentTypes, validatorTypes } from '@@ddf';
import { transformSelectOptions, handleSchemaFieldChange } from './helper';

const getFieldName = (fname, index) =>
  (typeof index !== 'undefined' ? `fields_${fname}_${index}` : `field_${fname}`);

const createClassFieldsSchema = (aeClassId, aeTypeOptions, dTypeOptions, selectedRowId, schemaField = {}) => {
  const classField = schemaField;

  const getInitialValue = (field, defaultVal = '') => {
    if (
      classField
      && typeof classField === 'object'
      && Object.keys(classField).length > 0
      && classField[field]
      && 'text' in classField[field]
    ) {
      return classField[field].text;
    }
    return defaultVal;
  };

  const getIcons = (index) => {
    if (
      classField
      && typeof classField === 'object'
      && Object.keys(classField).length > 0
      && classField.Name
      && 'icon' in classField.Name
    ) {
      return classField.Name.icon[index];
    }
    return '';
  };

  const getType = (options, icon) => {
    const match = options.find(
      (item) => item[2] && item[2]['data-icon'] === icon
    );

    return match ? match[1] : null;
  };

  return {
    fields: [
      {
        component: componentTypes.TEXT_FIELD,
        name: getFieldName('name', selectedRowId),
        id: getFieldName('name', selectedRowId),
        label: __('Name'),
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        initialValue: getInitialValue('Name'),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.SELECT,
        name: getFieldName('aetype', selectedRowId),
        id: getFieldName('aetype', selectedRowId),
        label: __('Type'),
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        placeholder: __('<Choose>'),
        options: transformSelectOptions(aeTypeOptions),
        includeEmpty: true,
        initialValue: getType(aeTypeOptions, getIcons(0)),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.SELECT,
        name: getFieldName('datatype', selectedRowId),
        id: getFieldName('datatype', selectedRowId),
        label: __('Data Type'),
        placeholder: __('<Choose>'),
        options: transformSelectOptions(dTypeOptions),
        includeEmpty: true,
        initialValue: getType(dTypeOptions, getIcons(1)),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: getFieldName('default_value', selectedRowId),
        id: getFieldName('default_value', selectedRowId),
        label: __('Default Value'),
        initialValue: getInitialValue('Default Value'),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: getFieldName('display_name', selectedRowId),
        id: getFieldName('display_name', selectedRowId),
        label: __('Display Name'),
        initialValue: getInitialValue('Display Name'),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: getFieldName('description', selectedRowId),
        id: getFieldName('description', selectedRowId),
        label: __('Description'),
        initialValue: getInitialValue('Description'),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.CHECKBOX,
        name: getFieldName('substitute', selectedRowId),
        id: getFieldName('substitute', selectedRowId),
        label: __('Sub'),
        initialValue: getInitialValue('Sub', true),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: getFieldName('collect', selectedRowId),
        id: getFieldName('collect', selectedRowId),
        label: __('Collect'),
        initialValue: getInitialValue('Collect'),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: getFieldName('message', selectedRowId),
        id: getFieldName('message', selectedRowId),
        label: __('Message'),
        initialValue: getInitialValue('Message', 'create'),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: getFieldName('on_entry', selectedRowId),
        id: getFieldName('on_entry', selectedRowId),
        label: __('On Entry'),
        initialValue: getInitialValue('On Entry'),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: getFieldName('on_exit', selectedRowId),
        id: getFieldName('on_exit', selectedRowId),
        label: __('On Exit'),
        initialValue: getInitialValue('On Exit'),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: getFieldName('on_error', selectedRowId),
        id: getFieldName('on_error', selectedRowId),
        label: __('On Error'),
        initialValue: getInitialValue('On Error'),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: getFieldName('max_retries', selectedRowId),
        id: getFieldName('max_retries', selectedRowId),
        label: __('Max Retries'),
        initialValue: getInitialValue('Max Retries'),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: getFieldName('max_time', selectedRowId),
        id: getFieldName('max_time', selectedRowId),
        label: __('Max Time'),
        initialValue: getInitialValue('Max Time'),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
    ],
  };
};

export default createClassFieldsSchema;
