import { componentTypes, validatorTypes } from '@@ddf';
import { transformSelectOptions, handleSchemaFieldChange } from './helper';

const getFieldName = (fname, index) =>
  (typeof index !== 'undefined' ? `fields_${fname}_${index}` : `field_${fname}`);


const createClassFieldsSchema = (aeClassId, aeTypeOptions, dTypeOptions, selectedRowId) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      name: getFieldName('name', selectedRowId),
      id: getFieldName('name', selectedRowId),
      label: __('Name'),
      isRequired: true,
      validate: [{ type: validatorTypes.REQUIRED }],
      onChange: (e) => handleSchemaFieldChange(aeClassId, e),
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
      onChange: (e) => handleSchemaFieldChange(aeClassId, e),
    },
    {
      component: componentTypes.SELECT,
      name: getFieldName('datatype', selectedRowId),
      id: getFieldName('datatype', selectedRowId),
      label: __('Data Type'),
      placeholder: __('<Choose>'),
      options: transformSelectOptions(dTypeOptions),
      includeEmpty: true,
      onChange: (e) => handleSchemaFieldChange(aeClassId, e),
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: getFieldName('default_value', selectedRowId),
      id: getFieldName('default_value', selectedRowId),
      label: __('Default Value'),
      onChange: (e) => handleSchemaFieldChange(aeClassId, e),
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: getFieldName('display_name', selectedRowId),
      id: getFieldName('display_name', selectedRowId),
      label: __('Display Name'),
      onChange: (e) => handleSchemaFieldChange(aeClassId, e),
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: getFieldName('description', selectedRowId),
      id: getFieldName('description', selectedRowId),
      label: __('Description'),
      onChange: (e) => handleSchemaFieldChange(aeClassId, e),
    },
    {
      component: componentTypes.CHECKBOX,
      name: getFieldName('substitute', selectedRowId),
      id: getFieldName('substitute', selectedRowId),
      label: __('Sub'),
      initialValue: true,
      onChange: (e) => handleSchemaFieldChange(aeClassId, e),
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: getFieldName('collect', selectedRowId),
      id: getFieldName('collect', selectedRowId),
      label: __('Collect'),
      onChange: (e) => handleSchemaFieldChange(aeClassId, e),
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: getFieldName('message', selectedRowId),
      id: getFieldName('message', selectedRowId),
      label: __('Message'),
      // initialValue: 'create',
      onChange: (e) => handleSchemaFieldChange(aeClassId, e),
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: getFieldName('on_entry', selectedRowId),
      id: getFieldName('on_entry', selectedRowId),
      label: __('On Entry'),
      onChange: (e) => handleSchemaFieldChange(aeClassId, e),
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: getFieldName('on_exit', selectedRowId),
      id: getFieldName('on_exit', selectedRowId),
      label: __('On Exit'),
      onChange: (e) => handleSchemaFieldChange(aeClassId, e),
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: getFieldName('on_error', selectedRowId),
      id: getFieldName('on_error', selectedRowId),
      label: __('On Error'),
      onChange: (e) => handleSchemaFieldChange(aeClassId, e),
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: getFieldName('max_retries', selectedRowId),
      id: getFieldName('max_retries', selectedRowId),
      label: __('Max Retries'),
      onChange: (e) => handleSchemaFieldChange(aeClassId, e),
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: getFieldName('max_time', selectedRowId),
      id: getFieldName('max_time', selectedRowId),
      label: __('Max Time'),
      onChange: (e) => handleSchemaFieldChange(aeClassId, e),
    },
  ],
});

export default createClassFieldsSchema;
