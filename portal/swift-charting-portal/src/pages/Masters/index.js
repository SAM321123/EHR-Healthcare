import React, { useCallback, useMemo, useState } from 'react';
import get from 'lodash/get';

import Table from 'src/components/Table';
import FilterComponents from 'src/components/FilterComponents';

import Events from 'src/lib/events';
import useQuery from 'src/hooks/useQuery';
import { MASTER_DATA, PRACTICE_ENUM_MASTERS_DATA } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import PageContent from 'src/components/PageContent';
import columns from './columns';
import MasterFormPage from './masterForm';

const handleOnValidateQuery = (query, userData) => {
  if (query?.code) {
    const modifiedQuery = { ...query };
    delete modifiedQuery.code;
    return {
      params: { ...modifiedQuery, practice: userData?.practice?.id },
      extraURL: `/${query.code}`,
    };
  }
  return false;
};

const Masters = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [rowData, setRowData] = useState({});

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
    validateQuery: handleOnValidateQuery,
  });

  const selectedMaster = get(filters, 'rawFilters', {});
  
  const responseModifier = useCallback(
    (data) => data.filter(item=>item.code!=='form_category'),
    []
  );
  const handleAddNewMaster = useCallback(() => {
    if (selectedMaster?.code) {
      setRowData({ isActive: true });
      setIsVisible(true);
    } else {
      Events.trigger('showSnackbar', {
        severity: 'error',
        message: 'Please choose a master',
      });
    }
  }, [selectedMaster]);

  const moreActions = useMemo(
    () => [
      {
        label: 'Edit',
        icon: 'edit',
        action: (data) => {
          const newData = { ...data, parentMasterCode: data?.parentMasterCode?.id };
          setRowData(newData);
          setIsVisible(true);
        },
      },
    ],
    []
  );

  const handleCloseModal = useCallback(() => {
    setRowData({});
    setIsVisible(false);
  }, []);

  const updatedColumns = useMemo(() => {
    const newColumns = [...columns];
    if (selectedMaster?.code === 'form_category') {
      const formCategoryColumn = {
        label: 'Type',
        type: 'text',
        dataKey: 'parentMasterCode.name',
      };
      newColumns.splice(1, 0, formCategoryColumn);
    }
    return newColumns;
  }, [selectedMaster]);

  const FilterCollectionHeader = FilterComponents({
    leftComponents: [
      {
        type: 'text',
        label: 'Masters',
      },
    ],
    rightComponents: [
      {
        type: 'wiredSelect',
        filterProps: {
          name: 'master',
          url: API_URL.getEnumMasterType,
          label: '',
          placeholder: 'Select Any Master',
          params: { isActive: true, practice: true },
          size: 'small',
          style: { maxWidth: '250px' },
          disableClearable: true,
          labelAccessor: 'name',
          valueAccessor: 'code',
          defaultValue: '',
          showPlaceholder: true,
          crudId: PRACTICE_ENUM_MASTERS_DATA,
          responseModifier,
        },
        name: 'code',
      },
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
        onClick: handleAddNewMaster,
      },
    ],
  });

  return (
    <>
      <PageContent loading={loading} className="masters-container">
        <Table
          headerComponent={
            <FilterCollectionHeader
              onFilterChange={handleFilters}
              filters={filters}
            />
          }
          data={mastersList?.results}
          totalCount={mastersList?.totalResults}
          columns={updatedColumns}
          pagination
          rowsPerPage={rowsPerPage}
          page={page}
          handlePageChange={handlePageChange}
          actionButtons={moreActions}
          loading={loading}
          sort={sort}
          handleSort={handleSort}
        />
      </PageContent>
      {isVisible && (
        <MasterFormPage
          isVisible={isVisible}
          setIsVisible={setIsVisible}
          handleCloseModal={handleCloseModal}
          selectedMaster={selectedMaster}
          rowData={rowData}
        />
      )}
    </>
  );
};

export default Masters;
