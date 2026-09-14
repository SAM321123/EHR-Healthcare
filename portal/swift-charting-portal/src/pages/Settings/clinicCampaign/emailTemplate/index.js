/* eslint-disable no-unused-vars */
import { isEmpty } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import AlertDialog from 'src/components/AlertDialog';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import useCRUD from 'src/hooks/useCRUD';
import useQuery from 'src/hooks/useQuery';
import { BLOCKED_USER_COLUMN } from 'src/lib/tableConstants';
import { roleFilterParser, showSnackbar } from 'src/lib/utils';
import { EMAIL_CAMPAIGN_TEMPLATE_LIST } from 'src/store/types';
import palette from 'src/theme/palette';
import ModalComponent from 'src/components/modal';
import { responseModifierRolesFoBlockedUser } from 'src/api/helper';
import EmailCampaignTemplateForm from './emailCampaignTemplateform';
import TableTextRendrer from 'src/components/TableTextRendrer';

const columns = [{
  label: 'ID',
  type: 'text',
  dataKey: 'id',
  sort: true,
},
{
  label: 'Name',
  type: 'text',
  dataKey: 'name',
  sort: true,

},
{
  label: 'Subject',
  type: 'text',
  dataKey: 'subject',
},
{
  label: 'Reply To',
  type: 'text',
  dataKey: 'replyTo',
  render: ({ data }) => (
    <TableTextRendrer style={{ maxWidth: '8rem' }}>
      {data?.replyTo || 'N/A'}
    </TableTextRendrer>
  )
},

];

const EmailTemplate = () => {
  const [openModal, setOpenModal] = useState(false);
  const [defaultData, setDefaultData] = useState();

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
    listId: EMAIL_CAMPAIGN_TEMPLATE_LIST,
    url: API_URL.emailCampaignTemplate,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,

  });

  const closeOpenModal = useCallback(() => {
    setOpenModal(false);
    setDefaultData(null);
  }, []);
  const handleEditTemplate = useCallback((rowData) => {
    if (rowData) {
      setDefaultData(rowData);
      setOpenModal(true);
    }
  }, []);


  const FilterCollectionHeader = useMemo(() => FilterComponents({
    leftComponents: [
      {
        type: 'search',
        filterProps: {
          placeholder: 'Search',
        },
        name: 'searchText',
      },
    ],
    rightComponents: [
      {
        type: 'fabButton',
        style: { ml: 2 },
        onClick: () => { setOpenModal(true) },
      },
    ],
  }), []);

  const moreActions = [
    {
      label: 'Edit',
      icon: 'edit',
      action: handleEditTemplate,
    },
  ];

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
      {openModal && (
        <ModalComponent
          open={openModal}
          header={{
            title: defaultData ? 'Edit Template' : 'Add Template',
            closeIconAction: closeOpenModal,
          }}
        >
          <EmailCampaignTemplateForm
            modalCloseAction={closeOpenModal}
            refetchData={handleOnFetchDataList}
            defaultData={defaultData}
          />

        </ModalComponent>
      )}
    </>
  );
};

export default EmailTemplate;
