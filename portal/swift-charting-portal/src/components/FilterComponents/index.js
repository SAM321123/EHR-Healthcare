import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { get, isEmpty, isFunction } from 'src/lib/lodash';
import WiredSelect from 'src/wiredComponent/Select';
import WiredAutoComplete from 'src/wiredComponent/AutoComplete';
import FilterSelect from 'src/wiredComponent/FilterSelect';
import Box from '../Box';
import FabButton from '../FabButton';
import Typography from '../Typography';
import SearchInput from '../SearchInput';
import RadioButtonGroup from '../ToggleButtonGroup';
import Button from '../Button';
import DownloadButton from '../DownloadButton';

import './filterComponents.scss';
import DateRangePickerComponent from '../DateRangePickerComponent';
import DatePickerComponent from '../DatePickerComponent';

const ComponentMap = {
  search: SearchInput,
  radioButtonGroup: RadioButtonGroup,
  downloadButton:DownloadButton,
  wiredSelect: WiredSelect,
  autocomplete: WiredAutoComplete,
  filterSelect:FilterSelect,
  datePicker: DatePickerComponent,

};
// console.log('ComponentMap',ComponentMap);
const FilterComponents = ({ leftComponents, rightComponents }) =>
  memo(
    ({
        onFilterChange,
        className,
        children,
        filters: { parsedFilters = {}, rawFilters = {} } = {},
      }) => {
      const handleFilterComponentChange = useCallback(
        (name, parser) => (filterInfo) => {
          let oldFilters = { ...parsedFilters };
          if (filterInfo || filterInfo === false) {
            oldFilters[name] = filterInfo;
          } else {
            delete oldFilters[name];
          }
          if (isFunction(parser)) {
            oldFilters = parser(oldFilters);
          }
          onFilterChange(oldFilters, { [name]: filterInfo });
        },
        [onFilterChange, parsedFilters]
      );

      const renderComponents = useCallback(
        (list) =>
          list?.map((item) => {
            if (item?.type === 'text') {
              return (
                <Box sx={{ display: 'flex', alignItems: 'center' }} key={item}>
                  <Typography
                    variant="h6"
                    onClick={item?.onClick}
                    sx={{ ...item.style }}
                    {...item}
                  >
                    {item.label}
                  </Typography>
                </Box>
              );
            }
            if (item?.type === 'fabButton') {
              return (
                <FabButton
                  key={item}
                  onClick={item?.onClick}
                  style={{height:31,margin:0, ...item.style }}
                  actionLabel={item.actionLabel}
                  disabled={item?.disabled}
                />
              );
            }
            if (item?.type === 'button') {
              return (
                <Button
                  key={item}
                  onClick={item?.onClick}
                  style={{height:31,margin:0, ...item.style }}
                  actionLabel={item.actionLabel}
                  disabled={item?.disabled}
                />
              );
            }
            if (ComponentMap[item?.type]) {
              const { type } = item;
              const FilterComponent = ComponentMap[type];
              return (
                <FilterComponent
                  key={item}
                  onChange={handleFilterComponentChange(
                    item?.name,
                    item?.parser
                  )}
                  parser={item?.parser}
                  {...item?.filterProps}
                  name={item.name}
                  reduxValue={get(rawFilters, item?.name)}
                  filtersParsed={parsedFilters}
                  filtersRaw={rawFilters}
                />
              );
            }
            if (item?.component) {
              const Component = item?.component;
              return (
                <Component
                  onChange={handleFilterComponentChange(
                    item?.name,
                    item?.parser
                  )}
                  name={item?.name}
                  defaultValue={get(rawFilters, item?.name)}
                  key={item}
                  reduxValue={get(rawFilters, item?.name)}
                  parser={item?.parser}
                  {...item?.filterProps}
                />
              );
            }
            return null;
          }),
        [handleFilterComponentChange, rawFilters, parsedFilters]
      );

      return (
        <div className="filters-container">
          <div
            className={classNames('filters-container-header', className)}
            data-testid="filters-header-test"
          >
            {!isEmpty(leftComponents) && (
              <Box className="left-content">
                {renderComponents(leftComponents)}
              </Box>
            )}
            {!isEmpty(rightComponents) && (
              <Box
                className="right-content"
                sx={{
                  justifyContent: {
                    xs: 'space-between',
                    sm: 'space-between',
                    md: 'flex-end',
                    lg: 'flex-end',
                    xl: 'flex-end',
                  },
                }}
              >
                 {renderComponents(rightComponents)}
               </Box>
             )}
          </div>
          {children}
        </div>
       );     
    }
  );

FilterComponents.defaultProps = {
  leftComponents: [],
  rightComponents: [],
  onFilterChange: () => {
    /* This is intentional */
  },
  filters: {},
  className: '',
  children: <span />,
};

FilterComponents.propTypes = {
  leftComponents: PropTypes.instanceOf(Object),
  rightComponents: PropTypes.instanceOf(Object),
  onFilterChange: PropTypes.func,
  filters: PropTypes.instanceOf(Object),
  className: PropTypes.string,
  children: PropTypes.node,
};

export default FilterComponents;
