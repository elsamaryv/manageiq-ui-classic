import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from '@carbon/react';
import { Draggable } from '@carbon/icons-react';

/**
 * Individual draggable field item
 */
const SequenceListItem = ({ field }) => {
  return(
    <div className="sequence-list-item">
      <Draggable />
      <Checkbox />
      <div className="item-name">
        {field.name}
      </div>
    </div>
  );
}; 

SequenceListItem.propTypes = {
};

export default SequenceListItem;