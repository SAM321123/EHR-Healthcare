import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Card,
  Typography,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CardHeader,
  CardContent,
} from '@mui/material';
import Table from 'src/components/Table';
import { dateFormats } from 'src/lib/constants';
import { dateFormatter, getFullName } from 'src/lib/utils';
import palette from 'src/theme/palette';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
// import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import Search from 'src/assets/images/Search.png';
import CreateOrder from 'src/pages/LabRadiology/createOrder';
import ModalComponent from 'src/components/modal';
import useQuery from 'src/hooks/useQuery';
import { LABS_RADIOLOGY_LIST } from 'src/store/types';
import { API_URL, MODULE, REQUEST_METHOD } from 'src/api/constants';
import { getLabsRadiologyEditData } from 'src/pages/LabRadiology/labsRadiologyHelper';
import AlertDialog from 'src/components/AlertDialog';
import { SAVE_LABS_RADIOLOGY_DATA } from 'src/store/types';
import { showSnackbar } from 'src/lib/utils';
import { isEmpty } from 'lodash';
import useCRUD from 'src/hooks/useCRUD';
import Events from 'src/lib/events';
import {  successMessage } from 'src/lib/constants';
import { LAB_RADIOLOGY_COLUMNS } from 'src/lib/tableConstants';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { RemoveRedEyeOutlined } from '@mui/icons-material';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { decrypt, encrypt } from 'src/lib/encryption';
import { UI_ROUTES } from 'src/lib/routeConstants';
import { getModulePermisions } from 'src/utils/genricMethods';
import useAuthUser from 'src/hooks/useAuthUser';
import FilterComponents from 'src/components/FilterComponents';


const LabsTable = ({ labsRadiologies }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultData, setDefaultData] = useState();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [labsRadiologyData, setLabsRadiologyData] = useState();
  const [sendToModalOpen, setSendToModalOpen] = useState(false);
  const navigate = useNavigate();
  const [sendToLabData, setSendToLabData]= useState();
  const [shareLabRadiologyData, setShareLabRadiologyData] = useState({});
  const params = useParams();
  let {patientId} = params || {};
  if(params.patientId){
    patientId= decrypt(patientId)
  }
  const [updatedResponse, , , callLabRadiologoDeleteAPI] = useCRUD({
    id: SAVE_LABS_RADIOLOGY_DATA,
    url: API_URL.labsRadiology,
    type: REQUEST_METHOD.update,
  });
  const [userInfo, , , , , , userData] = useAuthUser();
  const { isCreate, isDelete, isUpdate, isRead, isShare } = getModulePermisions({ moduleName: MODULE.labsRadiology, userData }) || {};
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
    listId: `${LABS_RADIOLOGY_LIST}-${patientId}`,
    url: API_URL.labsRadiology,
    type: REQUEST_METHOD.get,
    subscribeSocket: true,
    queryParams:{patientId}
  });
  const names = [
    'Oliver Hansen',
    'Van Henry',
    'April Tucker',
    'Ralph Hubbard',
    'Omar Alexander',
    'Carlos Abbott',
    'Miriam Wagner',
    'Bradley Wilkerson',
    'Virginia Andrews',
    'Kelly Snyder',
  ];
  function getStyles(name, personName, theme) {
    return {
      fontWeight:
        personName.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  }
  const theme = useTheme();
  const [personName, setPersonName] = React.useState([]);
  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setPersonName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value
    );
  };
  const handleEditLabsRadiology = (data) => {
    const editData = getLabsRadiologyEditData(data);
    setDefaultData(editData);
    setModalOpen(true);
  };
  const deleteDialogBox = useCallback((data) => {
    setLabsRadiologyData(data);
    setDeleteModalOpen((value) => !value);
  }, []);
  const closeOrderModal = useCallback(() => {
    setModalOpen(false);
    setDefaultData(null);
  }, []);
  const deleteOrder = useCallback(() => {
    if (labsRadiologyData) {
      const { id } = labsRadiologyData;

      callLabRadiologoDeleteAPI({ isDeleted: true }, `/${id}`);
    }
    setDeleteModalOpen((pre) => !pre);
  }, [callLabRadiologoDeleteAPI, labsRadiologyData]);
  // const dialogActions = useMemo(
  //   () => [
  //     {
  //       title: 'Cancel',
  //       action: () => setDeleteModalOpen((current) => !current),
  //       actionStyle: { color: palette.common.black, padding: '8px' },
  //       variant: 'secondary',
  //     },
  //     {
  //       title: 'Confirm',
  //       action: deleteOrder,
  //       actionStyle: { color: palette.primary.main, padding: '8px' },
  //       variant: 'secondary',
  //     },
  //   ],
  //   [deleteOrder]
  // );
  useEffect(() => {
    if (!isEmpty(updatedResponse)) {
      showSnackbar({
        message: updatedResponse.deletedById ? successMessage.delete : successMessage.update,
        severity: 'success',
      });
      Events.trigger(`REFRESH-PATIENT-DETAIL-${updatedResponse.patientId}`);
    }
  }, [updatedResponse]);

  // const handleViewHl7Data = (data) => {
  //   const labRadiologyId = data?.id;
  //   navigate(
  //     generatePath(UI_ROUTES.labRequest, {
  //       labRadiologyId: encrypt(String(labRadiologyId)),
  //     })
  //   );
  // }
  // const handleViewResult = (data) => {
  //   const labRadiologyId = data?.id;
  //   navigate(
  //     generatePath(UI_ROUTES.labRadiologyResult, {
  //       labRadiologyId: encrypt(String(labRadiologyId)),
  //     })
  //   );
  // }


  const columns = useMemo(() => [...LAB_RADIOLOGY_COLUMNS]);

  const handleShare = (data) =>{
    setShareLabRadiologyData(data);
  }
  const moreActions = (row) => {
    const actions = [
      isDelete && {
        label: 'Delete',
        icon: 'delete',
        action: () => deleteDialogBox(row),
      },
    ];

    if(row.hl7Message){
      isShare && actions.unshift({
        label: 'Share',
        icon: 'share',
        action: () => handleShare(row), 
      }); 
    }
    return actions;
  };

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
  return (
    <Card
      style={{
        border: '1px solid #E8E8E8',
        margin: '1em 2em',
        padding: '1em 0.5em',
      }}
    >
      <CardHeader title="Labs" />
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
             
{/*     
      {modalOpen && (
        <ModalComponent
          open={modalOpen}
          header={{
            title: 'Edit Order',
            closeIconAction: closeOrderModal,
          }}
          modalStyle={{width:'100%'}}
          boxStyle={{maxWidth:'1000px',width:'100%'}}
        >
          <CreateOrder
            modalCloseAction={closeOrderModal}
            refetchData={()=>{}}
            defaultData={defaultData}
            fromMain={false}
          />
        </ModalComponent>
      )} */}
      {/* <AlertDialog
        open={deleteModalOpen}
        content="Are you sure you want to delete?"
        actions={dialogActions}
      /> */}
    </Card>
  );
};

export default LabsTable;
