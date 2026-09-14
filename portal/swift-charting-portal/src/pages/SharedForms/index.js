import React from 'react';

import useQuery from 'src/hooks/useQuery';
import { formFilterStatus } from 'src/lib/constants';
import { patientFilterParser } from 'src/lib/utils';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';

import Table from 'src/components/Table';
import Container from 'src/components/Container';
import PageContent from 'src/components/PageContent';
import FilterComponents from 'src/components/FilterComponents';
import sharedFormColumns from './column';

const formStatusOptions = Object.entries(formFilterStatus)?.map(
  ([key, value]) => ({
    id: key,
    value,
  })
);

const handleValidateQuery = (params) => {
  const modifiedQuery = { ...params };
  if (modifiedQuery?.status === 'ALL') {
    delete modifiedQuery?.status;
  }

  return {
    params: { ...modifiedQuery },
  };
};

const FilterCollectionHeader = FilterComponents({
  leftComponents: [
    {
      type: 'text',
      label: 'Shared Forms',
    },
  ],
  rightComponents: [
    {
      type: 'autocomplete',
      filterProps: {
        name: 'sharedformPatientFilter',
        url: API_URL.getPatients,
        label: '',
        placeholder: 'Filter by Patient',
        size: 'small',
        style: { maxWidth: '220px' },
      },
      name: 'patient',
      parser: patientFilterParser,
    },
    {
      type: 'wiredSelect',
      filterProps: {
        name: 'sharedFormStatusFilter',
        defaultOptions: formStatusOptions,
        label: '',
        size: 'small',
        style: { maxWidth: '250px' },
        labelAccessor: 'id',
        valueAccessor: 'value',
        isAllOptionNeeded: true,
        defaultValue: 'ALL',
        disableClearable: true,
      },
      name: 'status',
    },
  ],
});

const SharedForms = ({ type }) => {
  const [
    response,
    loading,
    page,
    rowsPerPage,
    handlePageChange,
    filters,
    handleFilters,
    sort,
    handleSort,
  ] = useQuery({
    listId: 'shared-form-builder-list',
    url: API_URL.sharedFormList,
    type: REQUEST_METHOD.get,
    queryParams: { formType: type },
    validateQuery: handleValidateQuery,
    subscribeSocket: true,
  });

  return (
    <Container className="form-builder-container">
      <PageContent
        style={{
          overflow: 'auto',
        }}
      >
        <Table
          headerComponent={
            <FilterCollectionHeader
              onFilterChange={handleFilters}
              filters={filters}
            />
          }
          data={response?.results}
          totalCount={response?.totalResults}
          columns={sharedFormColumns}
          pagination
          rowsPerPage={rowsPerPage}
          page={page}
          handlePageChange={handlePageChange}
          loading={loading}
          sort={sort}
          itemStyle={{ textTransform: 'capitalize' }}
          handleSort={handleSort}
        />
      </PageContent>
    </Container>
  );
};
export default SharedForms;
