/* eslint-disable no-unused-vars */
import { useCallback, useMemo, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import useQuery from 'src/hooks/useQuery';
import { MAIL_COMPOSE_LIST } from 'src/store/types';
import palette from 'src/theme/palette';
import ModalComponent from 'src/components/modal';
import TableTextRendrer from 'src/components/TableTextRendrer';
import ComposedMailForm from './composedMailForm';
import { dateFormats } from 'src/lib/constants';
import EmailClinicViewModal from './clinicModal'; // Ensure this path matches your file name

const columns = [
  {
    label: 'ID',
    type: 'text',
    dataKey: 'id',
    sort: true,
  },
  {
    label: 'Date',
    type: 'date',
    dataKey: 'createdAt',
    maxWidth: '10rem',
    format: dateFormats.MMDDYYYYhhmmA,
    sort: true,
  },
  {
    label: 'Template',
    type: 'text',
    dataKey: 'templateName', // Changed from templateName to match your backend response
  },
  // {
  //   label: 'Clinics',
  //   type: 'text',
  //   dataKey: 'clinicName',
  //   render: ({ data }) => (
  //     <TableTextRendrer>
  //       {Array.isArray(data?.clinicName)
  //         ? data?.clinicName.join(', ')
  //         : data?.clinicName || 'N/A'}
  //     </TableTextRendrer>
  //   ),
  // },
  // {
  //   label: 'Status',
  //   type: 'status',
  //   dataKey: 'status',
  // },
];

const ComposedEmail = () => {
  const [openModal, setOpenModal] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMailId, setSelectedMailId] = useState(null);

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
    listId: MAIL_COMPOSE_LIST,
    url: API_URL.composeMail,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
  });

  const closeOpenModal = useCallback(() => {
    setOpenModal(false);
  }, []);

  const handleViewDetails = useCallback((rowData) => {
    setSelectedMailId(rowData?.id);
    setOpenDialog(true);
  }, []);

  // Fixed the syntax error here by adding closing braces and returning actions correctly
  const moreActions = useMemo(
    () => (row) => {
      return [
        {
          label: 'View Audit',
          icon: 'view',
          action: () => handleViewDetails(row),
        },
      ];
    },
    [handleViewDetails]
  );

  const FilterCollectionHeader = useMemo(
    () =>
      FilterComponents({
        leftComponents: [
          {
            type: 'search',
            filterProps: {
              placeholder: 'Search Template',
            },
            name: 'searchText',
          },
        ],
        rightComponents: [
          {
            type: 'fabButton',
            actionLabel: 'Compose Mail',
            style: { ml: 2 },
            onClick: () => {
              setOpenModal(true);
            },
          },
        ],
      }),
    []
  );

  return (
    <>
      <Container
        style={{ display: 'flex', flexDirection: 'column' }}
        loading={loading}
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
          columns={columns}
          pagination
          rowsPerPage={rowsPerPage}
          page={page}
          handlePageChange={handlePageChange}
          actionButtons={moreActions}
          loading={loading}
          sort={sort}
          handleSort={handleSort}
          wrapperStyle={{
            backgroundColor: palette.common.white,
            boxShadow: 'none',
            border: `1px solid ${palette.grey[200]}`,
            borderRadius: '0 5px 5px',
          }}
        />
      </Container>

      {/* The Individual Audit Modal we built */}
      <EmailClinicViewModal
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        mailId={selectedMailId}
      />

      {openModal && (
        <ModalComponent
          open={openModal}
          header={{
            title: 'Compose Mail',
            closeIconAction: closeOpenModal,
          }}
          modalStyle={{}}
        >
          <ComposedMailForm
            modalCloseAction={closeOpenModal}
            refetchData={handleOnFetchDataList}
          />
        </ModalComponent>
      )}
    </>
  );
};

export default ComposedEmail;
