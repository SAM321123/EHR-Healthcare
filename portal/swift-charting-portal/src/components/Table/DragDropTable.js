/* eslint-disable import/order */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-nested-ternary */
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import MUICheckbox from '@mui/material/Checkbox';

import { get, isFunction, isEmpty } from 'src/lib/lodash';
import palette from 'src/theme/palette';
import useSelection from './tableHook/useSelection';
import { convertWithTimezone, dateFormatter } from '../../lib/utils';
// import CheckboxLabel from '../form/Checkbox';
import ActionButton from '../ActionButton';
import Pagination from '../Pagination';
import SimpleLoader from '../Loader';
import './table.scss';
import './table.css';

import Iconify from '../iconify/Iconify';
import Typography from '../Typography';
import TableMenu from './TableMenu';
import TableChips from './tableChips';
import styled from '@emotion/styled';
import TableTextRendrer from '../TableTextRendrer';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

const StickyHeadTable = ({
  columns = [],
  data = [],
  headerStyle = {},
  itemStyle = {},
  containerStyle = {},
  wrapperStyle = {},
  rowsPerPage = 0,
  loading = false,
  headerComponent: TableHeader,
  pagination = false,
  totalCount = 0,
  page = 1,
  handlePageChange = () => {},
  onRowClick = () => {},
  moreActions = [],
  getSelectedIds = () => {},
  defaultSelectedIDs = [],
  handleSort,
  sort,
  actionButtons,
  timezone,
  footer = null,
  isScroll = false,
  onUpdateRows,
  getRowStyle = () => ({}),
}) => {
  const theme = useTheme();
  const tableColor = get(theme, 'palette.table', {});

  // const [sortedData, setSortedData] = useState(data);
  // const [sortedColumns, setSortedColumns] = useState([]);
  // const [sortedDirectionData, setSortedDirectionData] = useState({});
  const [selectedIDs, handleOnSelected, handleOnAllSelected] = useSelection({
    tableData: data,
    getSelectedIds,
    defaultSelectedIDs,
  });
  const checkedSelectionIntermediate = useMemo(
    () => data?.filter((ele) => selectedIDs[ele?.id]).length,
    [selectedIDs, data]
  );

  const allChecked = useMemo(
    () =>
      Object.keys(selectedIDs).length
        ? data?.every((ele) => selectedIDs[ele?.id])
        : false,
    [selectedIDs, data]
  );

  const handleRowClick = useCallback(
    (row) => () => {
      if (isFunction(onRowClick)) {
        onRowClick(row);
      }
    },
    [onRowClick]
  );

  const handleSorting = useCallback(
    (dataKey, order) => () => {
      if (isFunction(handleSort)) {
        handleSort(dataKey, order);
      }
    },
    [handleSort]
  );

  const getColumnKey = useCallback(
    (column, columnIndex) =>
      column?.id || column?.dataKey || column?.label || `column-${columnIndex}`,
    []
  );

  const getRowKey = useCallback(
    (row, rowIndex) => row?.id || row?.code || row?._id || `row-${rowIndex}`,
    []
  );

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) return;

    const updatedRows = [...data];

    // Remove the dragged element from the source index
    const [movedItem] = updatedRows.splice(source.index, 1);

    // Insert the dragged element at the destination index
    updatedRows.splice(destination.index, 0, movedItem);

    // Update state or trigger update function
    onUpdateRows(updatedRows);
  };
  return (
    <>
      <div
        className="table_paper"
        style={{
          flex: 1,
          height: '100%',
          backgroundColor: palette.background.paper,
          border: `0.97px solid ${palette.border.main}`,
          borderRadius: '7.79px',
          borderBottom: 'none',
          ...wrapperStyle,
        }}
      >
        <div className="table-filter-wrapper"> {TableHeader}</div>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="table-body">
            {(provided) => (
              <TableContainer
                ref={provided.innerRef}
                className="table_container"
                style={{
                  ...containerStyle,
                  ...(isScroll && {
                    maxHeight: '620px', // Set max height if scrolling is enabled
                    overflowY: 'auto', // Enable vertical scrolling
                  }),
                }}
              >
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow
                      sx={{
                        '& th': {
                          backgroundColor: palette.background.babyBlue,
                        },
                      }}
                    >
                      {columns.map((column, columnIndex) => (
                        <TableCell
                          size="small"
                          key={getColumnKey(column, columnIndex)}
                          style={{ width: column?.width }}
                          data-testId={`${column?.dataKey}-column`}
                          className={column.fixed ? 'pinnedColumn' : 'header'}
                          sx={{
                            backgroundColor: tableColor?.headerBackground,
                            maxWidth: column.maxWidth || '4rem',
                            ...headerStyle,
                          }}
                        >
                          <div
                            className="header_cell"
                            style={{
                              color: palette.text.dull,
                              lineHeight: '20px',
                              fontWeight: 400,
                              alignItems: 'center',
                              // borderBlock: 'none',
                              fontSize: 12,
                            }}
                          >
                            {column?.label}
                            {column?.type === 'selection' && (
                              <MUICheckbox
                                key={column?._id}
                                indeterminate={
                                  checkedSelectionIntermediate > 0 &&
                                  checkedSelectionIntermediate < data?.length
                                }
                                checked={allChecked}
                                onChange={handleOnAllSelected}
                              />
                            )}
                            {column.sort ? (
                              <div className="sortLabel" data-testId="sorting">
                                <Iconify
                                  onClick={handleSorting(column?.dataKey, -1)}
                                  icon="raphael:arrowup"
                                  cursor="pointer"
                                  ml={-0.5}
                                  mb={-0.5}
                                  sx={{
                                    width: 'auto',
                                    height: 'auto',
                                    color:
                                      !isEmpty(sort) &&
                                      sort[column?.dataKey] === -1
                                        ? palette.background.main
                                        : 'inherit',
                                  }}
                                />
                                <Iconify
                                  onClick={handleSorting(column?.dataKey, 1)}
                                  icon="raphael:arrowdown"
                                  cursor="pointer"
                                  ml={-0.5}
                                  sx={{
                                    width: 'auto',
                                    height: 'auto',
                                    padding: 0,
                                    color:
                                      !isEmpty(sort) &&
                                      sort[column?.dataKey] === 1
                                        ? palette.background.main
                                        : 'inherit',
                                  }}
                                />
                              </div>
                            ) : null}
                          </div>
                        </TableCell>
                      ))}
                      {!isEmpty(
                        typeof actionButtons === 'function'
                          ? actionButtons({})
                          : actionButtons
                      ) ? (
                        <TableCell
                          className="pinnedColumn"
                          sx={{
                            backgroundColor: tableColor?.headerBackground,
                            color: tableColor?.itemColor,
                            // borderBlock: 'none',
                            ...headerStyle,
                          }}
                        >
                          <div
                            className="header_cell"
                            style={{
                              color: palette.text.dull,
                              lineHeight: '20px',
                              fontWeight: 400,
                              alignItems: 'center',
                              fontSize: 12,
                            }}
                          >
                            Action
                          </div>
                        </TableCell>
                      ) : null}
                      {!isEmpty(
                        typeof moreActions === 'function'
                          ? moreActions({})
                          : moreActions
                      ) ? (
                        <TableCell
                          className="pinnedColumn"
                          sx={{
                            backgroundColor: tableColor?.headerBackground,
                            color: tableColor?.itemColor,
                            // borderBlock: 'none',
                            ...headerStyle,
                          }}
                        />
                      ) : null}
                    </TableRow>
                  </TableHead>
                  <TableBody {...provided.droppableProps}>
                    {loading ? (
                      <TableCell
                        align="center"
                        colSpan={columns?.length}
                        className="table_loader"
                      >
                        <SimpleLoader type="circular" loading={loading} />
                      </TableCell>
                    ) : !loading && isEmpty(data) ? (
                      <TableCell
                        align="center"
                        colSpan={columns?.length}
                        className="table_loader"
                      >
                        <Typography style={{ color: palette.text.offWhite }}>
                          Select Category First
                        </Typography>
                      </TableCell>
                    ) : (
                      data.map((row, rowIndex) => {
                        const rowKey = getRowKey(row, rowIndex);
                        return (
                        <Draggable
                          key={rowKey}
                          draggableId={String(rowKey)}
                          index={rowIndex}
                        >
                          {(provided , snapshot) => (
                            <TableRow
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              hover
                              role="checkbox"
                              tabIndex={-1}
                              onClick={handleRowClick(row)}
                              sx={{
                                cursor: 'pointer',
                                '&:hover': {
                                  backgroundColor: '#B8E0FF !important',
                                },
                                backgroundColor:
                                  rowIndex % 2 === 0
                                    ? palette.background.paper
                                    : palette.background.tableGray,
                                opacity: snapshot.isDragging ? 0.5 : 1,
                                transition: 'opacity 0.2s ease', 
                                ...getRowStyle(row),
                              }}
                              
                              data-testid="tableBody_test"
                            >
                              {columns.map((column, columnIndex) => {
                                const columnKey = getColumnKey(column, columnIndex);
                                if (column?.render) {
                                  const Component = column?.render;
                                  return (
                                    <TableCell
                                      key={`${rowKey}-${columnKey}`}
                                      style={{
                                        // borderBlock: 'none',
                                        cursor: 'pointer',
                                        ...itemStyle,
                                      }}
                                      // onClick={(e) => e?.stopPropagation()}
                                    >
                                      <Component
                                        data={row}
                                        {...column}
                                        index={rowIndex}
                                      />
                                    </TableCell>
                                  );
                                }
                                switch (column?.type) {
                                  case 'index':
                                    return (
                                      <TableCell
                                        key={`${rowKey}-${columnKey}`}
                                        className={
                                          column.fixed
                                            ? 'pinnedRows'
                                            : 'table_cell'
                                        }
                                        style={{
                                          // borderBlock: 'none',
                                          ...itemStyle,
                                        }}
                                      >
                                        {rowIndex + 1}
                                      </TableCell>
                                    );
                                  case 'selection':
                                    return (
                                      <TableCell
                                        key={`${rowKey}-${columnKey}`}
                                        className={
                                          column?.fixed
                                            ? 'pinnedRows'
                                            : 'table_cell'
                                        }
                                        style={{
                                          // borderBlock: 'none',
                                          ...itemStyle,
                                        }}
                                      >
                                        <MUICheckbox
                                          checked={
                                            selectedIDs[row?.id] || false
                                          }
                                          onChange={(event) =>
                                            handleOnSelected(event, row)
                                          }
                                        />
                                      </TableCell>
                                    );
                                  case 'text':
                                    return (
                                      <TableCell
                                        key={`${rowKey}-${columnKey}`}
                                        className={
                                          column?.fixed
                                            ? 'pinnedRows'
                                            : 'table_cell'
                                        }
                                        style={{
                                          // borderBlock: 'none',
                                          ...itemStyle,

                                          maxWidth: column.maxWidth || '6rem',
                                          ...column?.cellStyle,
                                        }}
                                        onClick={(e) =>
                                          column?.onClick
                                            ? column.onClick(row, e)
                                            : {}
                                        }
                                      >
                                        <div style={{display: 'flex' , alignItems: 'center'}}>
                                         <DragIndicatorIcon
                                            sx={{
                                              color: 'gray',
                                              verticalAlign: 'middle',
                                            }}
                                          />
                                        <TableTextRendrer>
                                          {get(row, column?.dataKey, 'N/A')}
                                        </TableTextRendrer>

                                        </div>
                                      </TableCell>
                                    );
                                  case 'date':
                                    return (
                                      <TableCell
                                        key={`${rowKey}-${columnKey}`}
                                        className={
                                          column?.fixed
                                            ? 'pinnedRows'
                                            : 'table_cell'
                                        }
                                        style={{
                                          // borderBlock: 'none',
                                          maxWidth: column.maxWidth || '6rem',
                                          ...itemStyle,
                                          ...column?.cellStyle,
                                        }}
                                        onClick={(e) =>
                                          column?.onClick
                                            ? column.onClick(row, e)
                                            : {}
                                        }
                                      >
                                        <TableTextRendrer>
                                          {' '}
                                          {!timezone
                                            ? dateFormatter(
                                                get(row, column?.dataKey, ''),
                                                column?.format
                                              )
                                            : convertWithTimezone(
                                                get(row, column?.dataKey, ''),
                                                { format: column?.format }
                                              )}
                                        </TableTextRendrer>
                                      </TableCell>
                                    );
                                  case 'button':
                                    return (
                                      <TableCell
                                        key={`${rowKey}-${columnKey}`}
                                        className={
                                          column.fixed
                                            ? 'pinnedRows'
                                            : 'table_cell'
                                        }
                                        style={{
                                          // borderBlock: 'none',
                                          color: tableColor?.cellItemColor,
                                          ...itemStyle,
                                        }}
                                      >
                                        <ActionButton
                                          label={column?.buttonLabel}
                                          className="buttonStyle"
                                          style={{
                                            backgroundColor:
                                              theme?.palette
                                                ?.actionButtonBackground,
                                          }}
                                        />
                                      </TableCell>
                                    );

                                  case 'boolean':
                                    return (
                                      <TableCell
                                        key={`${rowKey}-${columnKey}`}
                                        className={
                                          column.fixed
                                            ? 'pinnedRows'
                                            : 'table_cell'
                                        }
                                        style={{
                                          // borderBlock: 'none',
                                          color: tableColor?.cellItemColor,
                                          ...itemStyle,
                                          maxWidth: column.maxWidth || '3rem',
                                        }}
                                      >
                                        {row?.isActive
                                          ? column?.activeData
                                          : column?.inActiveData}
                                      </TableCell>
                                    );
                                  case 'chips':
                                    return (
                                      <TableCell
                                        key={`${rowKey}-${columnKey}`}
                                        className={
                                          column.fixed
                                            ? 'pinnedRows'
                                            : 'table_cell'
                                        }
                                        style={{
                                          // borderBlock: 'none',
                                          ...itemStyle,
                                        }}
                                      >
                                        <TableChips row={row} column={column} />
                                      </TableCell>
                                    );
                                  default:
                                    return (
                                      <TableCell
                                        key={`${rowKey}-${columnKey}`}
                                        style={{
                                          // borderBlock: 'none',
                                          ...itemStyle,
                                        }}
                                      />
                                    );
                                }
                              })}
                              <TableMenu
                                moreActions={
                                  typeof moreActions === 'function'
                                    ? moreActions(row)
                                    : moreActions
                                }
                                actionButtons={
                                  typeof actionButtons === 'function'
                                    ? actionButtons(row)
                                    : actionButtons
                                }
                                row={row}
                                itemStyle={itemStyle}
                              />
                            </TableRow>
                          )}
                        </Draggable>
                        );
                      })
                    )}
                    {provided.placeholder}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      {footer}
      {pagination && (
        <Pagination
          totalCount={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          handlePageChange={handlePageChange}
        />
      )}
    </>
  );
};

StickyHeadTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  headerStyle: PropTypes.object,
  containerStyle: PropTypes.object,
  wrapperStyle: PropTypes.object,
  itemStyle: PropTypes.object,
  rowsPerPage: PropTypes.number,
  loading: PropTypes.bool,
  headerComponent: PropTypes.node,
  pagination: PropTypes.bool,
  totalCount: PropTypes.number,
  page: PropTypes.number,
  handlePageChange: PropTypes.func,
  moreActions: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
  onRowClick: PropTypes.func,
  getSelectedIds: PropTypes.func,
  defaultSelectedIDs: PropTypes.array,
  handleSort: PropTypes.func,
  sort: PropTypes.object,
  actionButtons: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
  timezone: PropTypes.bool,
  footer: PropTypes.node,
  isScroll: PropTypes.bool,
  onUpdateRows: PropTypes.func,
  getRowStyle: PropTypes.func,
};

export default StickyHeadTable;
