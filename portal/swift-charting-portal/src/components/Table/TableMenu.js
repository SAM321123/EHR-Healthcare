import React from 'react';
import PropTypes from 'prop-types';
import { TableCell } from '@mui/material';
import { isEmpty } from 'src/lib/lodash';
import useResponsive from 'src/hooks/useResponsive';
import MoreActions from './MoreActions';
import TableActionButton from '../TableActionButton';
import './table.scss';

const TableMenu = ({ row, itemStyle, actionButtons, moreActions,  actionToHide, checkFieldToHide,}) => {
  const mdUp = useResponsive('up', 'md');

  let moreActionData = [];
  let updatedActionData = actionButtons
  if (actionToHide && checkFieldToHide && !isEmpty(row?.[checkFieldToHide])) {
    updatedActionData = actionButtons?.filter(action => action.label !== actionToHide)
  }
  if (
    !isEmpty(updatedActionData) &&
    updatedActionData.length > 1 &&
    isEmpty(moreActions) &&
    !mdUp
  )
    moreActionData = [...updatedActionData];

  if (!isEmpty(moreActions) && mdUp) moreActionData = [...moreActions];
  else if (!isEmpty(moreActions))
    moreActionData = [...moreActions, ...(updatedActionData || [])];

  return (
    <>
      {!isEmpty(updatedActionData) && (mdUp || updatedActionData.length === 1) && (
        <TableCell
          className="pinnedRows"
          style={{
            // borderBlock: 'none',
            ...itemStyle,
            width: updatedActionData.length * 50,
            backgroundColor: 'white'
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <TableActionButton buttons={updatedActionData} row={row} />
        </TableCell>
      )}

      {!isEmpty(moreActionData) && (
        <TableCell
          className="pinnedRows"
          style={{
            // borderBlock: 'none',
            ...itemStyle,
            width: '50px',
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <MoreActions actions={moreActionData} data={row} />
        </TableCell>
      )}
    </>
  );
};

TableMenu.defaultProps = {
  row: {},
  itemStyle: {},
  actionButtons: [],
  moreActions: [],
};

TableMenu.propTypes = {
  row: PropTypes.instanceOf(Object),
  itemStyle: PropTypes.instanceOf(Object),
  actionButtons: PropTypes.instanceOf(Array),
  moreActions: PropTypes.instanceOf(Array),
};

export default TableMenu;
