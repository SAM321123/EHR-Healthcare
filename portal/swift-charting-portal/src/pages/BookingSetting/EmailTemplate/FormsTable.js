
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import useQuery from 'src/hooks/useQuery';

import Table from 'src/components/Table';

import TableTextRendrer from 'src/components/TableTextRendrer';
import { CardContent } from '@mui/material';
import { useCallback, useMemo } from 'react';
import LoadingButton from 'src/components/CustomButton/loadingButton';



const FormsTable = ({ type ,planEditorRef, closeFormModal}) => {
  
  const formColumns =  useMemo(() => {

    return [
  
      {
        label: 'Name',
        type: 'text',
        dataKey: 'name',
        maxWidth: '7rem',
      },
      {
        label: 'Form Category',
        type: 'text',
        dataKey: 'formType.name',
        maxWidth: '15rem',
      },
      {
        label: 'Form Code',
        type: 'text',
        maxWidth: '15rem',
        render: ({ data }) => {
          const formCode = `FORMCODE_${data.id}`
          return(
            <TableTextRendrer>{formCode}</TableTextRendrer>
          )
        },

      },
      {
        label: 'Action',
        type: 'text',
        maxWidth: '15rem',
        render: ({ data }) => {
          return(
            <LoadingButton variant="outlinedSecondary" onClick={()=>onRowClick(data)} label={'Add Keyword'}/>
          )
        },

      },
    ];
  },[]);
  const onRowClick = useCallback(
    (row) => {
      planEditorRef.current.insertContent(`FORMCODE_${row.id}`);
      closeFormModal()
    },
    []
  );
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
    listId: 'FORMS_LIST',
    url: API_URL.getFormList,
    type: REQUEST_METHOD.get,
    queryParams: {
      formTypeCode: type,
    },
    subscribeSocket:true,
  });

  return (
    <CardContent>
      <Table
        loading={loading}
        data={sharedFormList?.results || sharedFormList}
        totalCount={sharedFormList?.totalResults}
        columns={formColumns}
        pagination
        rowsPerPage={rowsPerPage}
        page={page}
        handlePageChange={handlePageChange}
        sort={sort}
        handleSort={handleSort}
        wrapperStyle={{ overflow: 'auto',border:'none' }}
        timezone
        itemStyle={{ textTransform: 'capitalize' }}
        // onRowClick={onRowClick}
      />

    </CardContent>
  );
};

export default FormsTable;
