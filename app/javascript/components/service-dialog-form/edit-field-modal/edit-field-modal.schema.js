// import { componentTypes } from '@data-driven-forms/react-form-renderer';
// import { componentTypes } from '@@ddf';
import { componentTypes } from '../component-types';
import {
  textFieldComponent,
  textAreaComponent,
  switchComponent,
  selectComponent,
  fieldArrayComponent,
  datePickerComponent,
  dateTimePickerComponent,
} from './fields.schema';

const fields = (tab) => tab.fields.map((item) => {
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
      return selectComponent(item);
    case componentTypes.DATE_PICKER:
      return datePickerComponent(item);
    case componentTypes.DATE_TIME_PICKER:
      return dateTimePickerComponent(item);
    default:
      return null;
  }
});

const tabs = (configuration) => configuration.map((tab, tabIndex) => (
  {
    name: tabIndex,
    title: tab.name,
    description: tab.name,
    fields: fields(tab),
  }));

export const createSchema = (configuration) => ({
  fields: [
    {
      component: 'tabs',
      name: 'tabs',
      fields: tabs(configuration),
    },
  ],
});
