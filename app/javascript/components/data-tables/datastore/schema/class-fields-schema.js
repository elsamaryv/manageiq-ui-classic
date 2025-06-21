import { componentTypes } from '@@ddf';
import { schemaHeaders } from '../helper';

const createSchemaEditSchema = (rows, setState, isSchemaModified) => ({
  fields: [
    {
      component: componentTypes.SUB_FORM,
      name: 'schema_editor_section',
      id: 'schema_editor_section',
      key: isSchemaModified,
      onChange: (newValue) => {
        debugger
        console.log("On change new val - ", newValue);
      },
      fields: [
        {
          component: 'schema-table',
          name: 'schema-table',
          id: 'schema-table',
          rows,
          headers: schemaHeaders(true),
          onCellClick: (selectedRow) => {
            switch (selectedRow.callbackAction) {
              case 'editClassField':
                setState((prev) => ({
                  ...prev,
                  selectedRowId: selectedRow.id,
                  isModalOpen: true,
                  formKey: !prev.formKey,
                }));
                break;
              case 'deleteClassField':
                setState((prev) => ({
                  ...prev,
                  rows: prev.rows.filter((field) => field.id !== selectedRow.id),
                }));
                break;
              default:
                break;
            }
          },
          onButtonClick: () => {
            setState((prev) => ({
              ...prev,
              selectedRowId: undefined,
              isModalOpen: true,
              formKey: !prev.formKey,
            }));
          },
        },
      ],
    },
  ],
});

export default createSchemaEditSchema;
