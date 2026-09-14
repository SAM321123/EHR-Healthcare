import React, { useCallback, useEffect, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';
import { REQUEST_METHOD } from 'src/api/constants';
import useCRUD from '../../hooks/useCRUD';
import { get } from 'lodash';

const withAutoComplete =
  (Component) =>
  ({
    defaultValue,
    name,
    index,
    labelAccessor = 'name',
    url,
    params,
    multiple,
    options,
    fetchInitial = false,
    reduxValue,
    extraAPIParams = {},
    showDescription = false,
    descriptionAccessor = '',
    ...restProps
  }) => {
    const [allData, setAllData] = useState([]);

    const [data, , loading, getData, clearData] = useCRUD({
      id: `wired-autocomplete-${restProps?.register?.name || name}`,
      url,
      type: REQUEST_METHOD.get,
    });

    useEffect(() => {
      const { reFetch, queryParams } = extraAPIParams || {};
      if (reFetch) {
        if (queryParams) {
          getData({ ...params, ...queryParams });
        } else {
          getData(
            { ...params },
            extraAPIParams?.reFetchData
              ? `/${extraAPIParams?.reFetchData}`
              : null
          );
        }
      }
    }, [extraAPIParams]);

    useEffect(() => () => {
      clearData(true);
    });

    useEffect(() => {
      if (fetchInitial && !data) {
        getData({ ...params, limit: 300 });
      }
    }, [fetchInitial]);

    const debounceSearch = useMemo(
      () =>
        debounce((searchText) => {
          getData({ ...params, searchText });
        }, 1000),
      [getData, params]
    );

    const handleOnSearch = useCallback(
      (e) => {
        const searchText = e.target.value;
        if (searchText.length > 2) {
          debounceSearch(searchText);
        }
      },
      [debounceSearch]
    );

    const handleOptionLabel = useCallback(
      (option) => {
        if (Array.isArray(labelAccessor)) {
          return `${labelAccessor
            .map((key) => get(option,key,''))
            .filter(Boolean)
            .join(' ')}${
            showDescription && option.description
              ? ` (${option.description})`
              : ''
          }`;
        }
        return `${get(option, labelAccessor, option)}${
          showDescription && get(option, descriptionAccessor, '')
            ? ` (${get(option, descriptionAccessor, '')})`
            : ''
        }`;
      },
      [labelAccessor]
    );

    // When 'data' changes, append 'data.results' to 'allData' to persist across searches
    useEffect(() => {
      if (data?.results) {
        setAllData((prevData) => {
          const newData = [...prevData, ...data.results];
          return newData.filter(
            (value, position, self) =>
              position ===
              self.findIndex((t) => JSON.stringify(t) === JSON.stringify(value))
          );
        });
      }
    }, [data]);

    return (
      <Component
        getOptionLabel={handleOptionLabel}
        loading={loading}
        data={options?.length ? options : allData || []}
        onSearch={handleOnSearch}
        multiple={multiple}
        defaultValue={reduxValue || defaultValue || []}
        labelAccessor={labelAccessor}
        {...restProps}
      />
    );
  };

export default withAutoComplete;
