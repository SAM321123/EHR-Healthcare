import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Events from 'src/lib/events';
import { setFilterData } from '../store/actions/crud';
import useFilterManager from './useFilterManager';
import useCRUD from './useCRUD';
import useLoggedInUser from './useLoggedInUser';

const useQuery = ({
  listId,
  url,
  type,
  rowsPerPage = 10,
  defaultFilters = {},
  validateQuery,
  queryParams = {},
  responseModifier,
  subscribeSocket,
  fetchInitial=true,
}) => {
  const dispatch = useDispatch();
  const skippedIntialFetch = useRef(false); 
  const filtersData = useSelector((state) =>
    state?.crud?.get(listId)?.get('readFilter')
  )?.get('data');
  const userData = useLoggedInUser();
  const [page, setPage] = useState(1);

  const [dataList, , dataLoading, callDataListAPI, clearDataListAPI, updateReadData] = useCRUD({
    id: listId,
    url,
    type,
    responseModifier,
    subscribeSocket,
  });

  const { parsedFilters, rawFilters, sort} = filtersData || {};

  const [handleFilters] = useFilterManager({
    filtersData,
    defaultFilters,
    rawFilters,
    listId,
    type,
    setPage
  });

  const handleOnFetchDataList = useCallback(() => {
    const sortKey = sort && JSON.stringify(sort).replace(/[{}"]/g, '');
    const params = {
      sortBy: sortKey,
      page,
      limit: rowsPerPage,
      ...(rawFilters?.searchText && { searchText: rawFilters?.searchText }),
      ...queryParams,
      ...parsedFilters,
    };
    if (validateQuery) {
      const query = validateQuery({ ...params }, userData);
      if (query) {
        callDataListAPI({ ...query.params }, query?.extraURL);
      }
    } else {
      callDataListAPI({ ...params });
    }
  }, [
    callDataListAPI,
    page,
    parsedFilters,
    queryParams,
    rawFilters?.searchText,
    rowsPerPage,
    sort,
    userData,
    validateQuery,
  ]);

  const handleSort = useCallback(
    (dataKey, order) => {
      dispatch(
        setFilterData(
          listId,
          {
            ...filtersData,
            sort: { [dataKey]: order },
          },
          type
        )
      );
    },
    [dispatch, filtersData, listId, type]
  );

  useEffect(() => {
    if(fetchInitial || skippedIntialFetch.current ){
    handleOnFetchDataList({
      appliedFilters: parsedFilters,
      skip: page && (page - 1) * rowsPerPage,
      page
    });
  }else{
    skippedIntialFetch.current=true;
  }
  }, [parsedFilters, sort, page, listId,skippedIntialFetch]);

  useEffect(() => {
    Events.on(`REFRESH-TABLE-${listId}`, listId, handleOnFetchDataList);
    return () => {
      Events.rm(`REFRESH-TABLE-${listId}`, listId);
    };
  }, [handleOnFetchDataList, listId]);

  const handlePageChange = useCallback(
    (event, newPage) => {
      setPage(newPage)
    },
    []
  );

  return [
    dataList,
    dataLoading,
    page,
    rowsPerPage,
    handlePageChange,
    filtersData,
    handleFilters,
    sort,
    handleSort,
    handleOnFetchDataList,
    callDataListAPI,
    updateReadData,
  ];
};

export default useQuery;
