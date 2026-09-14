import React, { useMemo } from 'react';
import omit from 'lodash/omit';

import Table from 'src/components/Table';
import FilterComponents from 'src/components/FilterComponents';

import useQuery from 'src/hooks/useQuery';
import { MASTER_DATA } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import columns from './columns';

const FormList = ({onAddClick, onEditClick}) => {

  const [
    mastersList,
    loading,
    page,
    rowsPerPage,
    handlePageChange,
    filters,
    handleFilters,
    sort,
    handleSort,
  ] = useQuery({
    listId: MASTER_DATA,
    url: `${API_URL.getMasters}`,
    type: REQUEST_METHOD.get,
  });

  const moreActions = useMemo(
    () => [
      {
        label: 'Edit',
        action: (data) => {
          const parsedRowData = omit(data, 'metaData');
          onEditClick(parsedRowData);
        },
      },
    ],
    [onEditClick]
  );

  const FilterCollectionHeader = FilterComponents({
    rightComponents: [
      {
        type: 'search',
        filterProps: {
          placeholder: 'Search by Name',
        },
        name: 'searchText',
      },
      {
        type: 'fabButton',
        style: { ml: 2 },
        onClick: onAddClick,
      },
    ],
  });

  return (
        <Table
          headerComponent={
            <FilterCollectionHeader
              onFilterChange={handleFilters}
              filters={filters}
            />
          }
          data={mastersList?.results}
          totalCount={mastersList?.totalResults}
          columns={columns}
          pagination
          rowsPerPage={rowsPerPage}
          page={page}
          handlePageChange={handlePageChange}
          moreActions={moreActions}
          loading={loading}
          sort={sort}
          handleSort={handleSort}
        />
  );
};

export default FormList;
