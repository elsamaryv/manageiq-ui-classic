import React from 'react';
import PropTypes from 'prop-types';
import SequenceListItem from './sequence-list-item';

/**
 * Draggable list of schema fields
 */
const SequenceList = ({ list }) => {
  return (
    <div className="sequence-list">
      <SequenceListItem/>
    </div>
  );
};

SequenceList.propTypes = {
};

export default SequenceList;