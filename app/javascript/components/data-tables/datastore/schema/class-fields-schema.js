import { componentTypes } from '@@ddf';
import { schemaHeaders } from '../helper';

const createSchemaEditSchema = (rows, setState, isSchemaModified) => {
  const handleAddField = () => {
    http.post(`/miq_ae_class/field_select?add=new&item=field`, { skipErrors: [400] })
      .then(() => {
        setState((prev) => ({
          ...prev,
          selectedRowId: undefined,
          isModalOpen: true,
          formKey: !prev.formKey,
        }));
      })
      .catch((error) => {
        console.error('Failed to add new field:', error);
      });
  };

  const handleFieldDelete = (index) => {
    const field = rows.find((field) => field.id === index);
    const fId = field.field_id || null;
    http.post(`/miq_ae_class/field_delete/${fId}?arr_id=${index}`, { skipErrors: [400] })
      .then(() => {
        setState((prev) => ({
          ...prev,
          rows: prev.rows.filter((field) => field.id !== index),
        }));
      })
      .catch((error) => {
        console.error('Failed to delete field:', error);
      });
  };

  return {
    fields: [
      {
        component: componentTypes.SUB_FORM,
        name: 'schema_editor_section',
        id: 'schema_editor_section',
        key: isSchemaModified,
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
                  handleFieldDelete(selectedRow.id);
                  break;
                default:
                  break;
              }
            },
            onButtonClick: handleAddField,
          },
        ],
      },
    ],
  };
};
export default createSchemaEditSchema;
