import { componentTypes } from '@@ddf';

const createSchema = (domains, selectedItems, domainName, typeName, isSingleItem, isSameDomain, showOverrideExisting) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      name: 'from_domain',
      label: __('From Domain'),
      isReadOnly: true,
      initialValue: domainName,
    },
    {
      component: componentTypes.SELECT,
      name: 'domain',
      label: __('To Domain'),
      isReadOnly: domains.length === 1,
      initialValue: domains.length > 0 ? domains[0].value : '',
      options: domains,
      isRequired: true,
      condition: {
        when: 'domain',
        isNotEmpty: true,
      },
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'new_name',
      label: __('New Name'),
      maxLength: 128,
      condition: {
        and: [
          { when: 'domain', pattern: /.*/ },
          { when: 'is_single_item', is: true },
          { when: 'is_same_domain', is: true },
        ],
      },
    },
    {
      component: componentTypes.CHECKBOX,
      name: 'override_source',
      label: __('Copy to same path'),
      initialValue: true,
    },
    {
      component: componentTypes.CHECKBOX,
      name: 'override_existing',
      label: __('Replace items if they already exist?'),
      initialValue: false,
      condition: {
        when: 'show_override_existing',
        is: true,
      },
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'namespace',
      label: __('Namespace'),
      helperText: __('Click the button to select a namespace from the tree'),
      condition: {
        when: 'override_source',
        is: false,
      },
    },
    {
      component: 'plain-text',
      name: 'selected_items_header',
      label: `${selectedItems.length} ${selectedItems.length === 1 ? __('Item') : __('Items')} ${__('selected to copy')}`,
    },
    {
      component: 'sub-form',
      name: 'selected_items_list',
      fields: selectedItems.map((item, index) => ({
        component: 'plain-text',
        name: `item_${index}`,
        label: item,
      })),
    },
    // Hidden fields to track state
    {
      component: componentTypes.TEXT_FIELD,
      name: 'is_single_item',
      hideField: true,
      initialValue: isSingleItem,
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'is_same_domain',
      hideField: true,
      initialValue: isSameDomain,
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'show_override_existing',
      hideField: true,
      initialValue: showOverrideExisting,
    },
  ],
});

export default createSchema;
