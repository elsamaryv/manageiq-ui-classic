import { componentTypes } from '@@ddf';

const uniqueTabNameValidator = (usedNames, currentTabName) => (value) => {
  if (!value) return undefined;

  const trimmed = value.trim().toLowerCase();

  const isDuplicate = usedNames
    .filter((name) => name.toLowerCase() !== currentTabName.toLowerCase())
    .map((name) => name.toLowerCase())
    .includes(trimmed);

  return isDuplicate ? __('Tab name must be unique.') : undefined;
};

export const createSchema = (usedNames, currentTabName) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      name: 'tab_name',
      label: 'Tab Name',
      className: 'tab-name',
      validate: [uniqueTabNameValidator(usedNames, currentTabName)],
    },
    {
      component: componentTypes.TEXTAREA,
      name: 'tab_description',
      label: __('Tab description'),
      maxLength: 128,
      className: 'tab-description',
    },
  ],
});
