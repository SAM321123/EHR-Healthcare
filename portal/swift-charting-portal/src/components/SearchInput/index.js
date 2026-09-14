import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { InputBase, useTheme } from '@mui/material';
import palette from 'src/theme/palette';
import searchIcon from "src/assets/images/searchIcon.png";
import { get, isFunction, debounce } from '../../lib/lodash';
import Iconify from '../iconify/Iconify';
import './searchInput.scss';

const SearchInput = (props) => {
  const {
    placeholder,
    onChange = () => {},
    defaultValue = '',
    reduxValue,
    maxLength = 60,
    height,
    style,
  } = props;
  const theme = useTheme();
  const tableHeaderColors = get(theme, 'palette.table.tableHeader', {});
  const [searchTerm, setSearchTerm] = useState(
    reduxValue === undefined ? defaultValue : reduxValue
  );

  const onSearch = useCallback(
    (searchValue) => {
      if (isFunction(onChange)) {
        onChange(searchValue);
      }
    },
    [onChange]
  );

  const debounceValidation = useMemo(
    () => debounce(onSearch, 1000),
    [onSearch]
  );

  const handleSearchChange = useCallback(
    (event) => {
      const value = get(event, 'target.value', '');
      setSearchTerm(value);
      debounceValidation(value);
    },
    [debounceValidation]
  );

  const handleOnClearSearch = useCallback(() => {
    setSearchTerm('');
    onChange(null);
  }, [onChange]);

  return (
    <InputBase
      placeholder={placeholder}
      value={searchTerm}
      onChange={handleSearchChange}
      style={{ height: `${height}`, ...style }}
      className="searchInput"
      sx={{
        '& .MuiInputBase-input': {
          color: tableHeaderColors?.searchInputColor,
        },
        fontSize: '11.68px',
        backgroundColor: palette.background.paper,
        border:`0.97px solid ${palette.border.main}`,
        color:'#999999'
      }}
      inputProps={{ maxLength }}
      data-testid="searchInput_test"
      endAdornment={
        <div
          style={{ color: tableHeaderColors?.searchIconColor }}
          className="right_container"
          data-testid="search-icon"
        >
          {searchTerm ? (
            <Iconify
              icon="eva:close-outline"
              onClick={handleOnClearSearch}
              cursor="pointer"
              sx={{ mr: 0.5, width: 16, height: 16 }}
            />
          ) : (
            <img src={searchIcon} alt="search" style={{width:15.42,height:15.42,objectFit:'contain'}}/>
          )}
        </div>
      }
    />
  );
};

SearchInput.propTypes = {
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  defaultValue: PropTypes.string,
  reduxValue: PropTypes.string,
  maxLength: PropTypes.number,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  style: PropTypes.object,
};

export default React.memo(SearchInput);
