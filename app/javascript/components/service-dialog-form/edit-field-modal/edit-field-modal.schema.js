// import { componentTypes } from '@data-driven-forms/react-form-renderer';
import { componentTypes } from '@@ddf';
// import { componentTypes } from '../component-types';
import {
  textFieldComponent,
  textAreaComponent,
  switchComponent,
  selectComponent,
  fieldArrayComponent,
  datePickerComponent,
  dateTimePickerComponent,
} from './fields.schema';

const fields = (tab, initialData) => tab.fields.map((item) => {
  switch (item.field) {
    case componentTypes.TEXT_FIELD:
      return textFieldComponent(item);
    case componentTypes.TEXTAREA:
      return textAreaComponent(item);
    case componentTypes.SWITCH:
      return switchComponent(item);
    case componentTypes.FIELD_ARRAY:
      return fieldArrayComponent(item);
    case componentTypes.SELECT:
      return selectComponent(item, initialData);
    case componentTypes.DATE_PICKER:
      return datePickerComponent(item);
    case 'date-time-picker':
      return dateTimePickerComponent(item, initialData);
    default:
      return null;
  }
});

const tabs = (configuration, initialData) => configuration.map((tab, tabIndex) => (
  {
    name: tabIndex,
    title: tab.name,
    description: tab.name,
    fields: fields(tab, initialData),
  }));

export const createSchema = (configuration, initialData) => ({
  fields: [
    {
      component: 'tabs',
      name: 'tabs',
      fields: tabs(configuration, initialData),
    },
  ],
});
