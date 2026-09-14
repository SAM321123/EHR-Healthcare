import { useState, useCallback, useEffect, useMemo } from 'react';

import useCRUD from 'src/hooks/useCRUD';
import useQuery from 'src/hooks/useQuery';
import Events from 'src/lib/events';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { EMAIL_TEMPLATE_DATA } from 'src/store/types';
import Table from 'src/components/Table';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import { roleTypes } from 'src/lib/constants';
import palette from 'src/theme/palette';
import Box from 'src/components/Box';
import PageHeader from 'src/components/PageHeader';
import AlertDialog from 'src/components/AlertDialog';
import { getFullName, showSnackbar } from 'src/lib/utils';
import { successMessage } from 'src/lib/constants';
import TableTextRendrer from 'src/components/TableTextRendrer';
import SendMailForm from './SendMailForm';
import { dateFormats } from 'src/lib/constants';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import EmailViewModal from './emailViewModal';
const columns = [
  {
    label: 'Clinic Name',
    type: 'text',
    dataKey: 'clinicName',
    sort: true,
    render: ({ data }) => (
      <TableTextRendrer>
        {Array.isArray(data?.clinicName) && data?.clinicName?.length
          ? data.clinicName.join(', ')
          : 'All'}
      </TableTextRendrer>
    ),
  },
  {
    label: 'Role',
    type: 'text',
    dataKey: 'role',
    //  render: (value) => JSON.stringify(value.data.role),
    render: ({ data }) => (
      <TableTextRendrer>
        {Array.isArray(data?.role) && data?.role?.length
          ? data.role.join(', ')
          : 'All'}
      </TableTextRendrer>
    ),
  },

  {
    label: 'Status',
    dataKey: 'status',
    type: 'text',
  },
  {
    label: 'Email Name',
    dataKey: 'emailName',
    type: 'text',
  },
  {
    label: 'Selection Mode',
    dataKey: 'selectionMode',
    type: 'text',
  },
  {
    label: 'Date',
    dataKey: 'dateTime',
    type: 'date',
    maxWidth: '10rem',
    format: dateFormats.MMDDYYYYhhmmA,
  },
  // {
  //   label: 'Appointment Type',
  //   dataKey: 'appointmentType',
  //   type: 'text',
  //   maxWidth: '15rem',
  //   render: ({ data }) => {
  //     return(
  //       <TableTextRendrer>{data?.appointmentType?.name || 'N/A'}</TableTextRendrer>
  //     )
  //   },

  // },
  {
    label: '',
  },
];

const EmailTemplateTable = (props) => {
  const { openForm = () => {} } = props || {};
  const [open, setOpen] = useState(false);
  const [showMailSendModal, setShowMailSendModal] = useState(false);
  const [templateData, setTemplateData] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMailId, setSelectedMailId] = useState(null);
  const [deleteApiResponse, , deleteLoadingStatus, apiHandler, clear] = useCRUD(
    {
      id: 'DeleteEmailTemplate',
      type: REQUEST_METHOD.update,
      url: API_URL.emailTemplates,
    }
  );

  const params = useParams();
  const navigate = useNavigate();
  const [
    templateList,
    fetchLoadingStatus,
    page,
    rowsPerPage,
    handlePageChange,
    filters,
    handleFilters,
    sort,
    handleSort,
  ] = useQuery({
    listId: EMAIL_TEMPLATE_DATA,
    url: API_URL.emailComposed,
    type: REQUEST_METHOD.get,
  });

  useEffect(() => {
    if (deleteApiResponse) {
      showSnackbar({
        severity: 'success',
        message: successMessage.delete,
      });
      clear();
      Events.trigger(`REFRESH-TABLE-${EMAIL_TEMPLATE_DATA}`);
    }
  }, [deleteApiResponse, clear]);
  const handleViewPatient = useCallback((rowData) => {
    setSelectedMailId(rowData?.id);
    setOpenDialog(true);
  }, []);
  const editTemplate = useCallback(
    (data) => {
      const defaultValue = {};
      Object.assign(defaultValue, data);
      defaultValue.emailTypeCode = defaultValue.emailTypeCode || '';

      openForm({
        defaultValue,
        id: data.id,
        type: REQUEST_METHOD.update,
      });
    },
    [openForm]
  );
  const sendMail = useCallback(() => {
    setShowMailSendModal(true);
  }, [setShowMailSendModal]);

  const closeMailModal = useCallback(() => {
    setShowMailSendModal(false);
  }, [setShowMailSendModal]);

  const deleteTemplate = useCallback((data) => {
    setTemplateData(data);
    setOpen((value) => !value);
  }, []);

  const handleDelete = useCallback(() => {
    const { id: templateId } = templateData;
    apiHandler({ isDeleted: true }, `/${templateId}`);
    setOpen((pre) => !pre);
  }, [apiHandler, templateData]);

  const moreActions = useMemo(
    () => (row) => {
      const actions = [
        // {
        //   label: 'Edit',
        //   icon: 'edit',
        //   action: editTemplate,
        // },
        {
          label: 'View',
          icon: 'view',
          action: handleViewPatient,
        },
      ];

      if (row.emailTypeCode === 'birthday') {
        actions.push({
          label: 'Send Mail',
          icon: 'send',
          action: sendMail,
        });
      }

      return actions;
    },
    [editTemplate, sendMail]
  );

  const dialogActions = useMemo(() => {
    const actionFields = [
      {
        title: 'Cancel',
        action: () => setOpen((current) => !current),
        actionStyle: { color: palette.common.black, padding: '8px' },
        variant: 'secondary',
      },
      {
        title: 'Confirm',
        action: handleDelete,
        actionStyle: { color: palette.primary.main, padding: '8px' },
        variant: 'secondary',
      },
    ];
    return actionFields;
  }, [handleDelete]);

  const FilterCollectionHeader = FilterComponents({
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
        onClick: () => {
          openForm({ type: REQUEST_METHOD.CREATE });
        },
      },
    ],
  });

  return (
    <Container
      style={{
        backgroundColor: palette.background.paper,
        padding: 0,
        boxShadow: `0px 0px 9px 4px ${palette.grey[200]}`,
      }}
      loading={fetchLoadingStatus || deleteLoadingStatus}
    >
      <Table
        headerComponent={
          <FilterCollectionHeader
            onFilterChange={handleFilters}
            filters={filters}
          />
        }
        data={templateList?.results}
        totalCount={templateList?.totalResults}
        columns={columns}
        pagination
        rowsPerPage={rowsPerPage}
        page={page}
        handlePageChange={handlePageChange}
        actionButtons={moreActions}
        loading={fetchLoadingStatus || deleteLoadingStatus}
        sort={sort}
        handleSort={handleSort}
        wrapperStyle={{
          backgroundColor: palette.common.white,
          boxShadow: 'none',
          border: `1px solid ${palette.grey[200]}`,
          borderRadius: '0 5px 5px',
        }}
      />
      <AlertDialog
        open={open}
        content="Are you sure you want to delete?"
        actions={dialogActions}
      />
      <EmailViewModal
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        mailId={selectedMailId}
      />
      {showMailSendModal && (
        <SendMailForm
          showMailSendModal={showMailSendModal}
          closeMailModal={closeMailModal}
        />
      )}
    </Container>
  );
};

export default EmailTemplateTable;
