import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setFilterData } from '../store/actions/crud';

const useFilterManager = ({
  filtersData = {},
  defaultFilters = {},
  rawFilters = {},
  listId,
  type,
  setPage,
}) => {
  const dispatch = useDispatch();

  const handleFilters = useCallback(
    (newFilters, oldFilters) => {
      setPage(1)
      // for saving filters in redux
      dispatch(
        setFilterData(
          listId,
          {
            ...filtersData,
            parsedFilters: { ...defaultFilters, ...newFilters },
            rawFilters: { ...defaultFilters, ...rawFilters, ...oldFilters },
            // page: 1,
          },
          type
        )
      );
    },
    [defaultFilters, dispatch, filtersData, listId, rawFilters, type]
  );

  return [handleFilters];
};

export default useFilterManager;
