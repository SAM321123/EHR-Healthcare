/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import FilterComponents from 'src/components/FilterComponents';
import Container from 'src/components/Container';
import Table from 'src/components/Table';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { encrypt } from 'src/lib/encryption';
import { UI_ROUTES } from 'src/lib/routeConstants';
import {
  encounterTypeFilterParser,
  getFullName,
  practitionerFilterParser,
  showSnackbar,
  triggerEvents,
} from 'src/lib/utils';
import useQuery from 'src/hooks/useQuery';
import { ENCOUNTERS_LIST } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';

import { dateFormats } from 'src/lib/constants';

import TableTextRendrer from 'src/components/TableTextRendrer';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import ModalComponent from 'src/components/modal';
import ViewEncounter from './viewEncounter';

const GenerateBills = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [viewEncounter, setViewEncounter] = useState(false);
  const [encounterToView, setEncounterToView] = useState(null);
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
    handleOnFetchDataList,
  ] = useQuery({
    listId: `${ENCOUNTERS_LIST}-BILL`,
    url: API_URL.patientEncounter,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
  });

  const FilterCollectionHeader = useMemo(
    () =>
      FilterComponents({
        leftComponents: [
          {
            type: 'search',
            filterProps: {
              placeholder: 'Search patient',
            },
            name: 'searchText',
          },
        ],
        rightComponents: [
          {
            type: 'wiredSelect',
            filterProps: {
              name: 'practitionerFilter',
              url: API_URL.staff,
              label: 'Practitioner',
              labelAccessor: [
                'title.name',
                'firstName',
                'middleName',
                'lastName',
              ],
              params: { isActive: true, limit: 300 },
              valueAccessor: 'id',
              placeholder: 'Filter by Practitioner',
              size: 'small',
              style: { maxWidth: '220px' },
              cache: false,
              clearData: true,
              isAllOptionNeeded: true,
              defaultValue: 'ALL',
            },
            name: 'practitionerId',
            parser: practitionerFilterParser,
          },
          {
            type: 'wiredSelect',
            filterProps: {
              name: 'encounterTypeCode',
              url: `${API_URL.getMasters}/encounter_types_code`,
              label: 'Encounter Type',
              labelAccessor: 'name',
              valueAccessor: 'code',
              placeholder: 'Encounter Type',
              size: 'small',
              style: { maxWidth: '220px' },
              cache: false,
              clearData: true,
              isAllOptionNeeded: true,
              defaultValue: 'ALL',
            },
            name: 'encounterTypeCode',
            parser: encounterTypeFilterParser,
          },
        ],
      }),
    []
  );

  const columns = [
    {
      label: 'Patient',
      type: 'text',
      dataKey: 'patientId',
      sort: true,
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {getFullName(data.patient || {})}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Prescriber',
      type: 'text',
      dataKey: 'assignedToId',
      sort: true,
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {getFullName(data?.assignedTo || {})}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Encounter Id',
      type: 'text',
      dataKey: 'id',
      sort: true,
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer style={{ maxWidth: '8rem' }}>
          {data?.id ? `EN${data?.id}` : 'N/A'}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Encounter Date',
      type: 'date',
      dataKey: 'startDate',
      maxWidth: '10rem',
      sort: true,
      format: dateFormats.MMMDDYYYYHHMMSS,
    },
    {
      label: 'Encounter Type',
      type: 'text',
      dataKey: 'encounterTypeCode',
      sort: true,
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer>{data?.encounterType?.name}</TableTextRendrer>
      ),
    },
    {
      label: 'Encounter Status',
      type: 'text',
      dataKey: 'atDraft',
      sort: true,
      maxWidth: '10rem',
      render: ({ data }) => (
        <TableTextRendrer>
          {data?.atDraft ? 'Unsigned' : 'Singed'}{' '}
        </TableTextRendrer>
      ),
    },
    {
      label: 'Super Bill',
      type: 'text',
      dataKey: 'atDraft',
      maxWidth: '10rem',
      render: ({ data }) => {
        return (
          <LoadingButton
            disabled={data?.atDraft}
            onClick={() => handleEditEncounter(data)}
            label={'Super Bill'}
            sx={{ height: 30 }}
          />
        );
      },
    },
  ];

  const handleViewEncounter = (data) => {
    setViewEncounter(true);
    setEncounterToView(data?.id);
  };

  const handleEditEncounter = useCallback((rowData) => {
    navigate(
      generatePath(UI_ROUTES.editPatientEncounter, {
        ...params,
        patientId: encrypt(String(rowData.patientId)),
        encounterId: encrypt(String(rowData?.id)),
      })
    );
  }, []);

  const handleCloseViewEncounter = () => {
    setViewEncounter(false);
    setEncounterToView(null);
  };

  const moreActions = useCallback((rowData) => {
    const actions = [];
    if (rowData?.atDraft) {
      actions.push({
        label: 'Edit',
        icon: 'edit',
        action: handleEditEncounter,
      });
    }
    if (!rowData?.atDraft) {
      actions.push({
        label: 'View',
        icon: 'view',
        action: handleViewEncounter,
      });
    }
    return actions;
  }, []);

  return (
    <>
      <Container
        loading={loading}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <Table
          headerComponent={
            <div>
              <FilterCollectionHeader
                onFilterChange={handleFilters}
                filters={filters}
              />
            </div>
          }
          data={response?.results || []}
          totalCount={response?.totalResults}
          columns={columns}
          pagination
          rowsPerPage={rowsPerPage}
          page={page}
          handlePageChange={handlePageChange}
          loading={loading}
          sort={sort}
          handleSort={handleSort}
          wrapperStyle={{ boxShadow: 'none', borderRadius: 0 }}
          timezone
          actionButtons={(rowData) => moreActions(rowData)}
        />
        {viewEncounter && (
          <ModalComponent
            open
            header={{
              title: `View Encounter`,
              closeIconAction: handleCloseViewEncounter,
            }}
            modalStyle={{ width: '100%' }}
          >
            <ViewEncounter
              modalCloseAction={handleCloseViewEncounter}
              encounterId={encounterToView}
            />
          </ModalComponent>
        )}
      </Container>
    </>
  );
};

export default GenerateBills;
