import React, { useCallback, useState, useMemo, useEffect } from 'react';
import Table from 'src/components/Table';
import palette from 'src/theme/palette';
import Container from 'src/components/Container';
import {
  DELETE_TREATMENT_PLAN_TEMPLATE_DATA,
  GET_TREATMENT_PLAN_TEMPLATE,
} from 'src/store/types';
import { getFullName, showSnackbar } from 'src/lib/utils';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useQuery from 'src/hooks/useQuery';
import FilterComponents from 'src/components/FilterComponents';
import ModalComponent from 'src/components/modal';
import AlertDialog from 'src/components/AlertDialog';
import useCRUD from 'src/hooks/useCRUD';
import { isEmpty } from 'lodash';
import { dateFormats } from 'src/lib/constants';
import TableTextRendrer from 'src/components/TableTextRendrer';
import { TemplateProvider } from './templateContext';
import TemplateForm from './templateForm';
import ViewTemplate from './viewModal';



const treatmentTemplateColumn = [
  {
    label: 'Name',
    type: 'text',
    dataKey: 'templateName',
    maxWidth: '10rem',
    sort: true,
  },
  {
    label: 'Description',
    type: 'text',
    dataKey: 'templateDescription',
    sort: true,
    maxWidth: '10rem',
    render: ({ data }) => (
      <div>
        <TableTextRendrer>{data?.description || 'N/A'}</TableTextRendrer>
      </div>
    ),
  },
  {
    label: 'Created Date',
    type: 'date',
    dataKey: 'createdAt',
    sort: true,
    format: dateFormats.MMDDYYYY,
  },
  {
    label: 'Created By',
    dataKey: 'createdBy',
    type: 'text',
    render: ({ data }) => (
      <div>
        <TableTextRendrer>{getFullName(data.createdBy)}</TableTextRendrer>
      </div>
    ),
  },
  {
    label: 'Reviewed By',
    dataKey: 'reviewedBy',
    type: 'text',
    render: ({ data }) => (
      <div>
        <TableTextRendrer>{getFullName(data.reviewedBy)}</TableTextRendrer>
      </div>
    ),
  },
];

const TreatmentPlanTemplateConfig = () => {
  const [openModal , setOpenModal] = useState(false);
  const [defaultData, setDefaultData] = useState();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [templateConfigData, setTemplateConfigData] = useState();

  const [
    templateData,
    loading,
    page,
    rowsPerPage,
    handlePageChange,
    filters,
    handleFilters,
    sort,
    handleSort,
    fetchData,
  ] = useQuery({
    listId: GET_TREATMENT_PLAN_TEMPLATE,
    url: API_URL.treatmentPlanTemplate,
    type: REQUEST_METHOD.get,
  }); 

  const [deleteResponse, , , callDeleteAPI, clearData] = useCRUD({
    id: DELETE_TREATMENT_PLAN_TEMPLATE_DATA,
    url: API_URL.treatmentPlanTemplate,
    type: REQUEST_METHOD.update,
  });

  const deleteConfig = useCallback(() => {
    if (templateConfigData) {
      const { id } = templateConfigData;
      callDeleteAPI({ isDeleted: true }, `/${id}`);
    }
    setDeleteModalOpen((pre) => !pre);
  }, [callDeleteAPI, templateConfigData]);

  const dialogActions = useMemo(
    () => [
      {
        title: 'Cancel',
        action: () => setDeleteModalOpen((current) => !current),
        actionStyle: { color: palette.common.black, padding: '8px' },
        variant: 'secondary',
      },
      {
        title: 'Confirm',
        action: deleteConfig,
        actionStyle: { color: palette.primary.main, padding: '8px' },
        variant: 'secondary',
      },
    ],
    [deleteConfig]
  );
  useEffect(() => {
    if (!isEmpty(deleteResponse)) {
      showSnackbar({
        message: 'Deleted successfully',
        severity: 'success',
      });
      clearData(true);
      fetchData();
    }
  }, [fetchData, deleteResponse, clearData]);

  const closeOpenModal = useCallback(() => {
    setOpenModal(false);
    setDefaultData(null);
  }, []);

  const handleEditPracticeLocation = useCallback((rowData) => {
    setDefaultData(rowData);
    setOpenModal(true);
  }, []);

  const deleteDialogBox = useCallback((data) => {
    setTemplateConfigData(data);
    setDeleteModalOpen((value) => !value);
  }, []);

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
    rightComponents:[
          {
            type: 'fabButton',
            style: { ml: 2 },
            onClick: () => { setOpenModal(true); },
          },
        ]
  });

  const moreActions =  [
      {
        label: 'Edit',
        icon: 'edit',
        action: handleEditPracticeLocation,
      },
      {
        label: 'Delete',
        icon: 'delete',
        action: deleteDialogBox,
      },
    ];

  return (
    <>
      <Container
         style={{
          backgroundColor: palette.background.paper,
          padding: 0,
          boxShadow: `0px 0px 9px 4px ${palette.grey[200]}`,
        }}
        loading={loading}
      >
        <Table
          headerComponent={
            <FilterCollectionHeader
              onFilterChange={handleFilters}
              filters={filters}
            />
          }
          data={templateData?.results}
          totalCount={templateData?.totalResults}
          columns={treatmentTemplateColumn}
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
          timezone
        />
        <AlertDialog
          open={deleteModalOpen}
          content="Are you sure you want to delete?"
          actions={dialogActions}
        />
      </Container>
      {openModal && (
        <ModalComponent
          modalStyle={{ width: '100%' }}
          open={openModal}
          header={{
            title: isEmpty(defaultData)
              ? 'Add Template'
              : 'Edit Template',
            closeIconAction: closeOpenModal,
          }}
        >
          <TemplateProvider>
            <TemplateForm
              modalCloseAction={closeOpenModal}
              refetchData={fetchData}
              defaultData={defaultData}
            />
          </TemplateProvider>
        </ModalComponent>
      )}
    </>
  );
};
export default TreatmentPlanTemplateConfig;
