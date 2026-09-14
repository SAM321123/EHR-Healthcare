/* eslint-disable no-unused-vars */
import isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL, MODULE, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';
import ModalComponent from 'src/components/modal';
import useQuery from 'src/hooks/useQuery';
import { dateFormats } from 'src/lib/constants';
import { getImageUrl, showSnackbar,getFullName } from 'src/lib/utils';
import { DOCUMENT_DATA, DOCUMENT_LIST } from 'src/store/types';

import { cloneDeep } from 'lodash';
import AlertDialog from 'src/components/AlertDialog';
import useCRUD from 'src/hooks/useCRUD';
import palette from 'src/theme/palette';
import PatientInfo from '../patientInfo';
import DocumentForm from './documentForm';
import { decrypt } from 'src/lib/encryption';
import { getModulePermisions } from 'src/utils/genricMethods';
import useAuthUser from 'src/hooks/useAuthUser';

const documentsColumns = [
  {
    label: 'File',
    type: 'Text',
    dataKey: 'fileId',
    maxWidth: '10rem',
    render: ({ data }) => (
      <a
        href={getImageUrl(data?.file?.file)}
        target="_blank"
        style={{ textDecoration: 'none' }}
      >
        <TableTextRendrer>View</TableTextRendrer>
      </a>
    ),
  },
  {
    label: 'Title',
    type: 'text',
    dataKey: 'title',
    sort: true,
    maxWidth: '10rem',
  },
  {
    label: 'Type',
    type: 'text',
    dataKey: 'typeCode',
    sort: true,
    maxWidth: '10rem',
    render: ({ data }) => (
        <TableTextRendrer>{data?.type?.name || 'N/A'} </TableTextRendrer>
    ),
  },
  {
    label: 'Description',
    type: 'text',
    dataKey: 'description',
    maxWidth: '10rem',
    render: ({data}) => <TableTextRendrer>{data?.description || 'N/A'}</TableTextRendrer>
  },
  {
    label: 'Assign to',
    type: 'text',
    dataKey: 'provider',
    maxWidth: '10rem',
    render:({data})=><TableTextRendrer>{getFullName(data?.provider)}</TableTextRendrer>,
  },
  {
    label: 'Document Date',
    dataKey: 'date',
    type: 'date',
    sort: true,
    format: dateFormats.MMDDYYYY,
  },
  {
    label: 'Upload Date',
    dataKey: 'updatedAt',
    type: 'date',
    sort: true,
    format: dateFormats.MMDDYYYY,
  },
];
const DocumentsList = () => {
  const params = useParams();
  const [defaultData, setDefaultData] = useState();
  const [modalOpen, setModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleteData, setDeleteData] = useState();

  let {patientId}= params || {}
  patientId =decrypt(patientId);

  const [userInfo, , , , , , userData] = useAuthUser();
  const { isCreate, isDelete, isUpdate, isRead, isPrint, isShare } = getModulePermisions({ moduleName: MODULE.patientDocument, userData }) || {}

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
    listId: DOCUMENT_LIST,
    url: API_URL.document,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams: { patientId },
  });

  const [deleteResponse, , , callDeleteAPI, clearData] = useCRUD({
    id: `${DOCUMENT_DATA}-delete`,
    url: API_URL.document,
    type: REQUEST_METHOD.update,
  });

  useEffect(() => {
    if (!isEmpty(deleteResponse)) {
      showSnackbar({
        message: 'Delete successfully',
        severity: 'success',
      });
      clearData(true);
      handleOnFetchDataList();
    }
  }, [handleOnFetchDataList, deleteResponse, clearData]);


  const deleteRecord = useCallback(() => {
    if (deleteData) {
      const { id } = deleteData;
      callDeleteAPI({ isDeleted: true }, `/${id}`);
    }
    setOpen((pre) => !pre);
  }, [callDeleteAPI, deleteData]);

  const deleteDialogBox = useCallback((data) => {
    setDeleteData(data);
    setOpen((value) => !value);
  }, []);

  const dialogActions = useMemo(
    () => [
      {
        title: 'Cancel',
        action: () => setOpen((current) => !current),
        actionStyle: { color: palette.common.black, padding: '8px' },
        variant: 'secondary',
      },
      {
        title: 'Confirm',
        action: deleteRecord,
        actionStyle: { color: palette.primary.main, padding: '8px' },
        variant: 'secondary',
      },
    ],
    [deleteRecord]
  );

  const handleEditDocuments = useCallback((rowData) => {
    console.log('🚀 ~ DocumentsList ~ rowData:', rowData);
    if (rowData) {
      const clonedRowData = cloneDeep(rowData);
      delete clonedRowData.fileId;
      setDefaultData(clonedRowData);
      setModalOpen(true);
    }
  }, []);

  const showDocumentsModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const closeDocumentsModal = useCallback(() => {
    setModalOpen(false);
    setDefaultData(null);
  }, []);

  const FilterCollectionHeader = useMemo(
    () =>
      FilterComponents({
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
          isCreate && {
            type: 'fabButton',
            style: { ml: 2, minWidth: '38px' },
            actionLabel: 'ADD DOCUMENTS',
            onClick: showDocumentsModal,
          },
        ],
      }),
    []
  );

  const moreActions = [
    isUpdate && {
      label: 'Edit',
      icon: 'edit',
      action: handleEditDocuments,
    },
    isDelete && {
      label: 'Delete',
      icon: 'delete',
      action: deleteDialogBox,
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
            <div>
              <PatientInfo wrapperStyle={{ marginBottom: 39 }} />
              <FilterCollectionHeader
                onFilterChange={handleFilters}
                filters={filters}
              />
            </div>
          }
          data={response?.results}
          totalCount={response?.totalResults}
          columns={documentsColumns}
          pagination
          rowsPerPage={rowsPerPage}
          page={page}
          handlePageChange={handlePageChange}
          loading={loading}
          sort={sort}
          handleSort={handleSort}
          wrapperStyle={{ boxShadow: 'none', borderRadius: 0 }}
          timezone
          actionButtons={moreActions}
        />
         <AlertDialog
          open={open}
          content="Are you sure you want to delete?"
          actions={dialogActions}
        />
      </Container>
      {modalOpen && (
        <ModalComponent
          open={modalOpen}
          header={{
            title: isEmpty(defaultData) ? 'Add Documents' : 'Edit Documents',
            closeIconAction: closeDocumentsModal,
          }}
        >
          <DocumentForm
            modalCloseAction={closeDocumentsModal}
            refetchData={handleOnFetchDataList}
            defaultData={defaultData}
          />
        </ModalComponent>
      )}
    </>
  );
};

export default DocumentsList;
