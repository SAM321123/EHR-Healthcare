import React, { useCallback, useMemo, useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { decrypt, encrypt } from 'src/lib/encryption';
import FilterComponents from 'src/components/FilterComponents';
import useQuery from 'src/hooks/useQuery';
import { ENCOUNTERS_LIST } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import TableTextRendrer from 'src/components/TableTextRendrer';
import { getFullName } from 'src/lib/utils';
import { dateFormats } from 'src/lib/constants';
import Table from 'src/components/Table';
import ModalComponent from 'src/components/modal';
import ViewEncounter from 'src/pages/MedicalBilling/viewEncounter';


const MedicalBillsTable = ({ medicalBillingData }) => {
  const navigate = useNavigate();
  const params = useParams();
  let { patientId } = params || {};
  if (params.patientId) {
    patientId = decrypt(patientId)
  }
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
    listId: `${ENCOUNTERS_LIST}-${patientId}`,
    url: API_URL.patientEncounter,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: { patientId },
  });
  const theme = useTheme();
  const [personName, setPersonName] = React.useState([]);
  const [viewEncounter, setViewEncounter] = useState(false);
  const [encounterToView, setEncounterToView] = useState(null);
  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setPersonName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value
    );
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
      }),
    []
  );

  const handleViewEncounter = (data) => {
    setViewEncounter(true);
    setEncounterToView(data?.id);
  };

   const handleCloseViewEncounter = () => {
    setViewEncounter(false);
    setEncounterToView(null);
  };
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
      <Card
        style={{
          border: '1px solid #E8E8E8',
          margin: '1em 2em',
          padding: '1em 0.5em',
        }}
      >
        <CardHeader title="Medical Bills" />
        <CardContent>
          <Table
            headerComponent={
              <div>
                <FilterCollectionHeader
                  onFilterChange={handleFilters}
                  filters={filters}
                />
              </div>
            }
            data={response?.results}
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
            actionButtons={row => moreActions(row)}
          />
        </CardContent>
      </Card>
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
    </>
  );
};

export default MedicalBillsTable;
