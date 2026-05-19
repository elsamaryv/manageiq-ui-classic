import React from 'react';
import { PropTypes } from 'prop-types';
import SequenceList from './sequence-list';


/**
 * Schema Sequence Editor Component
 * Allows reordering of schema fields using drag-and-drop or up/down buttons
 */
const SchemaSequenceEditor = ({classId}) => {

  return (
    <div className='schema-sequence-editor'>
      <div className='sequence-editor-header'>
      </div>
      <div className="sequence-editor-content">
      </div>
      <div className="sequence-controls-container">
      </div>

      <div className="sequence-editor-actions">
        <Button>
        </Button>
        <Button>
        </Button>
      </div>
    </div>
  );
};

SchemaSequenceEditor.propTypes = {
  classId: PropTypes.string.isRequired,
};

export default SchemaSequenceEditor;