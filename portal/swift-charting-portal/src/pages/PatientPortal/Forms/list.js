import { useCallback } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { API_URL, BASE_URL, REQUEST_METHOD } from 'src/api/constants';
import FilterComponents from 'src/components/FilterComponents';
import Table from 'src/components/Table';
import useAuthUser from 'src/hooks/useAuthUser';
import useQuery from 'src/hooks/useQuery';
import { dateFormats } from 'src/lib/constants';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { downloadPdf } from 'src/lib/utils';

export const formColumns = [
  {
    label: 'Form Name',
    type: 'text',
    dataKey: 'formData.name',
  },
  {
    label: 'Shared At',
    type: 'date',
    dataKey: 'createdAt',
    format: dateFormats.MMMDDYYYYHHMMSS,
  },
];

const FormsList = ( { shared= false }={} ) => {
  const params = useParams();
  const navigate = useNavigate();
  const [userData] = useAuthUser();

  const FilterCollectionHeader = FilterComponents({
    leftComponents: [
      {
        type: 'text',
        label: shared ? 'Notes':"Forms",
      },
    ],
  });

  const [
    sharedFormList,
    loading,
    page,
    rowsPerPage,
    handlePageChange,
    ,
    ,
    sort,
    handleSort,
  ] = useQuery({
    listId: shared ? 'PATIENT_SHARED_FORMS_LIST_NOTE_TEMPLATE': 'PATIENT_SHARED_FORMS_LIST',
    url: API_URL.sharedFormList,
    type: REQUEST_METHOD.get,
    queryParams: {
      patientId: userData?.id,
      ...(shared? { formType: 'FT_NOTE_TEMPLATES' }: {})
    },
    subscribeSocket:true,
  });

  const handleRowClick = useCallback(
    (rowData) => {
      navigate(
        generatePath(shared ? UI_ROUTES.viewSharedForm : UI_ROUTES.viewForm, { ...params, formId: rowData?.id })
      );
      // navigate(
      //   generatePath(`${UI_ROUTES.patientSharedForms}/${rowData?.id}`)
      // );
    },
    [navigate, params]
  );

  const moreActions = [
    {
      label: 'Download',
      icon: 'download',
      action: (row) => {
        if(row?.id) downloadPdf(`/${API_URL.downloadPatientFormPDF}/${row?.id}`)
      },
    },
  ];

  return (
    <Table
      loading={loading}
      headerComponent={<FilterCollectionHeader />}
      data={sharedFormList?.results || sharedFormList}
      totalCount={sharedFormList?.totalResults}
      columns={formColumns}
      pagination
      rowsPerPage={rowsPerPage}
      page={page}
      handlePageChange={handlePageChange}
      sort={sort}
      handleSort={handleSort}
      onRowClick={handleRowClick}
      wrapperStyle={{ overflow: 'auto' }}
      actionButtons={moreActions}
    />
  );
};

export default FormsList;
