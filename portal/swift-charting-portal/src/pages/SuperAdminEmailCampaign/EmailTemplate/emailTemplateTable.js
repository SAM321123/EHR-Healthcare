// import { useState, useCallback, useEffect, useMemo } from 'react';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import TableTextRendrer from 'src/components/TableTextRendrer';
import useAuthenticatedUser from 'src/hooks/useAuthenticatedUser';
import useCRUD from 'src/hooks/useCRUD';
import useQuery from 'src/hooks/useQuery';
import { successMessage } from 'src/lib/constants';
import Events from 'src/lib/events';
import { showSnackbar } from 'src/lib/utils';
import {
  EMAIL_TEMPLATE_DATA,
  SUPER_ADMIN_EMAIL_TEMPLATE_DATA,
} from 'src/store/types';
import palette from 'src/theme/palette';
import Table from 'src/components/Table';
import AlertDialog from 'src/components/AlertDialog';
import SendMailForm from 'src/pages/BookingSetting/EmailTemplate/SendMailForm';

const columns = [
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
  // {
  //   label: 'Email Type',
  //   dataKey: 'emailType.name',
  //   type: 'text',
  // },
  // {
  //   label: 'Appointment Type',
  //   dataKey: 'appointmentType',
  //   type: 'text',
  //   maxWidth: '15rem',
  //   render: ({ data }) => {
  //     return (
  //       <TableTextRendrer>
  //         {data?.appointmentType?.name || 'N/A'}
  //       </TableTextRendrer>
  //     );
  //   },
  // },
  // {
  //   label: '',
  // },
];

const EmailTemplateTable = (props) => {
  const { openForm = () => {} } = props || {};
  const [open, setOpen] = useState(false);
  const [showMailSendModal, setShowMailSendModal] = useState(false);
  const [templateData, setTemplateData] = useState({});
  const authenticatedUser = useAuthenticatedUser();

  const [deleteApiResponse, , deleteLoadingStatus, apiHandler, clear] = useCRUD(
    {
      id: 'DeleteEmailTemplate',
      type: REQUEST_METHOD.update,
      url: API_URL.emailTemplates,
    }
  );

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
    listId: SUPER_ADMIN_EMAIL_TEMPLATE_DATA,
    url: API_URL.adminEmailTemplate,
    type: REQUEST_METHOD.get,
  });

  useEffect(() => {
    if (deleteApiResponse) {
      showSnackbar({
        severity: 'success',
        message: successMessage.delete,
      });
      clear();
      Events.trigger(`REFRESH-TABLE-${SUPER_ADMIN_EMAIL_TEMPLATE_DATA}`);
    }
  }, [deleteApiResponse, clear]);

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
        {
          label: 'Edit',
          icon: 'edit',
          action: editTemplate,
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
