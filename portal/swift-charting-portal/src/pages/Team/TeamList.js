import React, { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import useQuery from 'src/hooks/useQuery';
import { TEAM_LIST } from 'src/store/types';
import { REQUEST_METHOD } from 'src/api/constants';
import FilterComponents from 'src/components/FilterComponents';
import Container from 'src/components/Container';
import Table from 'src/components/Table';
import { roleTypes } from 'src/lib/constants';
import FormModal from 'src/components/modal';
import { isEmpty, upperCase } from 'src/lib/lodash';
import { getUserRole } from 'src/lib/utils';
import { useParams } from 'react-router-dom';
import AddTeamMember from './AddTeamMember';
import AddStaff from '../admin/AddStaff';

const TeamList = (props) => {
  const { type, api, columns } = props;
  console.log("🚀 ~ TeamList ~ api:", api)
  const params = useParams();
  const [isAddNewMemberModal, setAddNewMemberModal] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const form = useForm({ mode: 'onChange' });
  const practiceId = useMemo(() => {
    if (getUserRole() === roleTypes.superAdmin) {
      return params?.clinicId;
    }
    return null;
  }, [params?.clinicId]);

  const [
    teamList,
    loading,
    page,
    rowsPerPage,
    handlePageChange,
    filters,
    handleFilters,
    sort,
    handleSort,
  ] = useQuery({
    listId: `${TEAM_LIST}_${upperCase(type)}`,
    url: practiceId ? `${'users/superAdmin'}?practice=${practiceId}&roleId=1` : 'users',
    type: REQUEST_METHOD.get,
  });

  const getButtonLabel = useCallback(
    (role) => {
      switch (role) {
        case roleTypes.clinicAdmin:
          if (isEmpty(selectedMember)) return 'Add Admin';
          return 'Update Admin';
        case roleTypes.assistant:
          if (isEmpty(selectedMember)) return 'Add Assistant';
          return 'Update Assistant';
        case roleTypes.practitioner:
          if (isEmpty(selectedMember)) return 'Add Practitioner';
          return 'Update Practitioner';
        default:
          return '';
      }
    },
    [selectedMember]
  );

  const toggleModal = useCallback(() => {
    if (isAddNewMemberModal) setSelectedMember(null);
    setAddNewMemberModal(!isAddNewMemberModal);
    form.reset();
  }, [isAddNewMemberModal]);

  const FilterCollectionHeader = FilterComponents({
    rightComponents: [
      {
        type: 'search',
        filterProps: {
          placeholder: 'Search by Name',
        },
        name: 'searchText',
      },
      {
        type: 'fabButton',
        style: { ml: 2 },
        onClick: () => toggleModal(),
      },
    ],
  });

  // const moreActions = [
  //   {
  //     label: 'Edit',
  //     icon: 'edit',
  //     action: (data) => {
  //       setSelectedMember(data);
  //       toggleModal();
  //     },
  //   },
  // ];

  return (
    <Container style={{ padding: 16 }} loading={loading}>
      <Table
        // headerComponent={
        //   <FilterCollectionHeader
        //     onFilterChange={handleFilters}
        //     filters={filters}
        //   />
        // }
        data={teamList?.results}
        totalCount={teamList?.totalResults}
        columns={columns}
        pagination
        rowsPerPage={rowsPerPage}
        page={page}
        handlePageChange={handlePageChange}
        // actionButtons={moreActions}
        loading={loading}
        sort={sort}
        handleSort={handleSort}
        wrapperStyle={{ boxShadow: 'none' }}
      />
      <FormModal
        open={isAddNewMemberModal}
        onClose={toggleModal}
        header={{
          title: getButtonLabel(type),
        }}
      >
        {type === roleTypes.clinicAdmin ? (
          <AddStaff
            form={form}
            modalCloseAction={toggleModal}
            isButton
            memberData={selectedMember}
            routeProps={{ api, type, clinicId: params?.clinicId }}
            isSuperAdmin={!!practiceId}
          />
        ) : (
          <AddTeamMember
            modalCloseAction={toggleModal}
            memberData={selectedMember}
            routeProps={{ api, type, clinicId: params?.clinicId }}
            isSuperAdmin={!!practiceId}
          />
        )}
      </FormModal>
    </Container>
  );
};

export default TeamList;
