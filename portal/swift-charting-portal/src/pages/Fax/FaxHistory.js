import { API_URL, BASE_URL, REQUEST_METHOD } from 'src/api/constants';
import Container from 'src/components/Container';
import Table from 'src/components/Table';
import TableTextRendrer from 'src/components/TableTextRendrer';
import useQuery from 'src/hooks/useQuery';
import { faxType, faxTypeMapping } from 'src/lib/constants';
import { downloadPdf, showSnackbar } from 'src/lib/utils';
import { GET_FAX_HISTORY } from 'src/store/types';
import palette from 'src/theme/palette';

const columns = [
  {
    label: 'Name',
    type: 'text',
    dataKey: 'faxContact.name',
  },
  {
    label: 'Fax Contact Number',
    type: 'text',
    dataKey: 'faxContact.faxNo',
  },
  {
    label: 'Fax Type',
    type: 'text',
    dataKey: 'faxType',
    render:({data})=><TableTextRendrer>{faxTypeMapping[data?.faxType] || 'N/A'}</TableTextRendrer>
  },

  {
    label: 'Status',
    type: 'chips',
    dataKey: 'status',
    tooltipAccessor:'result'
  },
];
const getDownloadUrl = (row = {}) => {
  if (row?.faxType === faxType.PATIENT_FORM && row?.patientForm?.id) {
    return `/${API_URL.downloadPatientFormPDF}/${row.patientForm.id}`;
  }

  if (
    row?.faxType === faxType.PATIENT_MEDICATION &&
    row?.patientMedication?.id
  ) {
    return `/${API_URL.downloadPatientMedicationPDF}/${row.patientMedication.id}`;
  }

  return null;
};

const moreActions = (row = {}) => {
  const downloadUrl = getDownloadUrl(row);

  return [
    {
      label: 'Download',
      icon: 'download',
      disabled: !downloadUrl && !!row?.id,
      preRender: () => ({
        opacity: downloadUrl || !row?.id ? 1 : 0.5,
        cursor: downloadUrl ? 'pointer' : 'not-allowed',
      }),
      action: () => {
        if (downloadUrl) {
          downloadPdf(downloadUrl);
          return;
        }

        showSnackbar({
          message:
            'Download is only available for Patient Form and Patient Medication fax records.',
          severity: 'info',
        });
      },
    },
  ];
};
const FaxHistory = () => {
  const [
    faxList,
    loading,
    page,
    rowsPerPage,
    handlePageChange,
    ,
    ,
    sort,
    handleSort,
  ] = useQuery({
    listId: GET_FAX_HISTORY,
    url: API_URL.faxHistory,
    type: REQUEST_METHOD.get,
  });
  return (
    <Container
      style={{
        backgroundColor: palette.background.paper,
        padding: 16,
        boxShadow: `0px 0px 9px 4px ${palette.grey[200]}`,
      }}
      loading={loading}
    >
      <Table
        data={faxList?.results}
        totalCount={faxList?.totalResults}
        columns={columns}
        pagination
        rowsPerPage={rowsPerPage}
        page={page}
        handlePageChange={handlePageChange}
        loading={loading}
        actionButtons={moreActions}
        sort={sort}
        handleSort={handleSort}
      />
    </Container>
  );
};

export default FaxHistory;
