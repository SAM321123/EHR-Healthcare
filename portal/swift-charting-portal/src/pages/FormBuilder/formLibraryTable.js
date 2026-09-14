import { useState, useMemo, useCallback } from 'react';
import useQuery from 'src/hooks/useQuery';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { FORM_LIBRARY_DATA } from 'src/store/types';
import Table from 'src/components/Table';
import Container from 'src/components/Container';
import FilterComponents from 'src/components/FilterComponents';
import palette from 'src/theme/palette';
import AddFormLibrary from './addFormLibrary';
import ModalComponent from 'src/components/modal';
import { generatePath } from 'react-router-dom';
import { UI_ROUTES } from 'src/lib/routeConstants';

const columns = [
  {
    label: 'Name',
    type: 'text',
    dataKey: 'name',
    sort: true,
  },
  {
    label: 'Form Category',
    type: 'text',
    dataKey: 'formCategory.name',
  },
  {
    label: 'Form Type',
    dataKey: 'formType.name',
    type: 'text',
  },
];

const FormLibraryTable = () => {
  const [defaultData, setDefaultData] = useState({});
  const [modalOpen, setModalOpen] = useState(false);

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
    listId: FORM_LIBRARY_DATA,
    url: API_URL.formLibrary,
    type: REQUEST_METHOD.get,
  });

  const handleModal = useCallback(() => {
    setModalOpen((prev) => !prev);
  }, []);
  const addFormLibrary = useCallback((data) => {
    const { id, name, formTypeCode } = data;
    setDefaultData({ id, name, formTypeCode  });

    handleModal();
  }, []);

  const handlePrint = (form) => {
    const path = generatePath(`/${UI_ROUTES.formLibrary}`, { formId: form.id });
    window.open(
      path,
      '_blank',
      'width=800,height=600,scrollbars=yes,resizable=yes'
    );
  };
  const moreActions = useMemo(
    () => [
      {
        label: 'Preview',
        icon: 'view',
        action: handlePrint,
      },
      {
        label: 'Import',
        icon: 'import',
        action: addFormLibrary,
      },
    ],
    [addFormLibrary]
  );

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
  });

  return (
    <Container
      style={{
        backgroundColor: palette.background.paper,
        padding: 0,
        boxShadow: `0px 0px 9px 4px ${palette.grey[200]}`,
      }}
      loading={fetchLoadingStatus}
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
        loading={fetchLoadingStatus}
        sort={sort}
        handleSort={handleSort}
        wrapperStyle={{
          backgroundColor: palette.common.white,
          boxShadow: 'none',
          border: `1px solid ${palette.grey[200]}`,
          borderRadius: '0 5px 5px',
        }}
      />
      <ModalComponent
        header={{
          title: 'Add Form Library',
          closeIconAction: handleModal,
        }}
        open={modalOpen}
        boxStyle={{ width: '60%' }}
      >
        <AddFormLibrary handleModal={handleModal} defaultData={defaultData} />
      </ModalComponent>
    </Container>
  );
};

export default FormLibraryTable;
