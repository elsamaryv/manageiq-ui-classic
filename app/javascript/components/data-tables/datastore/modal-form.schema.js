import { componentTypes, validatorTypes } from '@@ddf';
import { transformSelectOptions, handleSchemaFieldChange } from './helper';

const createClassFieldsSchema = (aeTypeOptions, dTypeOptions, selectedRowId, schemaField = {}) => {
  const classField = schemaField;
  console.log("Classfield -- ", classField);
  // const getFieldName = (fname, index) =>
  // (typeof index !== 'undefined' ? `fields_${fname}_${index}` : `field_${fname}`);

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
      && classField.name
      && 'icon' in classField.name
    ) {
      return classField.name.icon[index];
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
        // name: getFieldName('name', selectedRowId),
        // id: getFieldName('name', selectedRowId),
        name: 'name',
        id: 'name',
        label: __('Name'),
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        initialValue: getInitialValue('name'),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.SELECT,
        // name: getFieldName('aetype', selectedRowId),
        // id: getFieldName('aetype', selectedRowId),
        name: 'aetype',
        id: 'aetype',
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
        // name: getFieldName('datatype', selectedRowId),
        // id: getFieldName('datatype', selectedRowId),
        name: 'datatype',
        id: 'datatype',
        label: __('Data Type'),
        placeholder: __('<Choose>'),
        options: transformSelectOptions(dTypeOptions),
        includeEmpty: true,
        initialValue: getType(dTypeOptions, getIcons(1)),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.TEXT_FIELD,
        // name: getFieldName('default_value', selectedRowId),
        // id: getFieldName('default_value', selectedRowId),
        name: 'default_value',
        id: 'default_value',
        label: __('Default Value'),
        initialValue: getInitialValue('default_value'),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.TEXT_FIELD,
        // name: getFieldName('display_name', selectedRowId),
        // id: getFieldName('display_name', selectedRowId),
        name: 'display_name',
        id: 'display_name',
        label: __('Display Name'),
        initialValue: getInitialValue('display_name'),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.TEXT_FIELD,
        // name: getFieldName('description', selectedRowId),
        // id: getFieldName('description', selectedRowId),
        name: 'description',
        id: 'description',
        label: __('Description'),
        initialValue: getInitialValue('description'),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.CHECKBOX,
        // name: getFieldName('substitute', selectedRowId),
        // id: getFieldName('substitute', selectedRowId),
        name: 'substitute',
        id: 'substitute',
        label: __('Sub'),
        initialValue: getInitialValue('substitute', true),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.TEXT_FIELD,
        // name: getFieldName('collect', selectedRowId),
        // id: getFieldName('collect', selectedRowId),
        name: 'collect',
        id: 'collect',
        label: __('Collect'),
        initialValue: getInitialValue('collect'),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.TEXT_FIELD,
        // name: getFieldName('message', selectedRowId),
        // id: getFieldName('message', selectedRowId),
        name: 'message',
        id: 'message',
        label: __('Message'),
        initialValue: getInitialValue('message', 'create'),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.TEXT_FIELD,
        // name: getFieldName('on_entry', selectedRowId),
        // id: getFieldName('on_entry', selectedRowId),
        name: 'on_entry',
        id: 'on_entry',
        label: __('On Entry'),
        initialValue: getInitialValue('on_entry'),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.TEXT_FIELD,
        // name: getFieldName('on_exit', selectedRowId),
        // id: getFieldName('on_exit', selectedRowId),
        name: 'on_exit',
        id: 'on_exit',
        label: __('On Exit'),
        initialValue: getInitialValue('on_exit'),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.TEXT_FIELD,
        // name: getFieldName('on_error', selectedRowId),
        // id: getFieldName('on_error', selectedRowId),
        name: 'on_error',
        id: 'on_error',
        label: __('On Error'),
        initialValue: getInitialValue('on_error'),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.TEXT_FIELD,
        // name: getFieldName('max_retries', selectedRowId),
        // id: getFieldName('max_retries', selectedRowId),
        name: 'max_retries',
        id: 'max_retries',
        label: __('Max Retries'),
        initialValue: getInitialValue('max_retries'),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
      {
        component: componentTypes.TEXT_FIELD,
        // name: getFieldName('max_time', selectedRowId),
        // id: getFieldName('max_time', selectedRowId),
        name: 'max_time',
        id: 'max_time',
        label: __('Max Time'),
        initialValue: getInitialValue('max_time'),
        // onChange: (e) => handleSchemaFieldChange(aeClassId, e),
      },
    ],
  };
};

export default createClassFieldsSchema;
