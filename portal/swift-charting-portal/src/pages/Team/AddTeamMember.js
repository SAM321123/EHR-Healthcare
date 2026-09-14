import { useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Stack,
  Unstable_Grid2 as Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import CustomForm from 'src/components/form';
import {
  getArrayDiff,
  inputLength,
  regEmail,
  regFirstname,
  requiredField,
  roleTypes,
  successMessage,
} from 'src/lib/constants';
import Container from 'src/components/Container';
import useCRUD from 'src/hooks/useCRUD';
import { STAFF_DATA, TEAM_LIST } from 'src/store/types';
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import ModalHeader from 'src/components/modal/header';
import {
  getUpdatedFieldsValue,
  showSnackbar,
  triggerEvents,
} from 'src/lib/utils';
import { upperCase, isEmpty } from 'src/lib/lodash';
import palette from 'src/theme/palette';
import { WiredPractitionerField } from 'src/wiredComponent/Form/FormFields';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import CustomButton from 'src/components/CustomButton';

const AddTeamMember = (props) => {
  const {
    routeProps,
    header = {},
    modalCloseAction,
    memberData = {},
    isSuperAdmin = false,
  } = props;
  const { api, type, clinicId } = routeProps || {};
  const { title = '' } = header || {};

  const [response, , loading, memberApi, clear] = useCRUD({
    id: `${STAFF_DATA}_${upperCase(type)}`,
    url: isEmpty(memberData) ? api : `${api}/${memberData?.id}`,
    type: isEmpty(memberData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
  });

  const [
    selectedMemberResponse,
    ,
    ,
    getSelectedMemberApi,
    clearSelectedMemberData,
  ] = useCRUD({
    id: `${TEAM_LIST}_${upperCase(type)}_SELECTED`,
    url: isEmpty(memberData) ? api : `${api}/${memberData?.id}`,
    type: REQUEST_METHOD.get,
  });

  const calcPractitionersDropDown = useCallback((data) => {
    const { allAssistant } = data;
    return { hide: allAssistant };
  }, []);

  const formDefaultValues = useMemo(
    () =>
      !isEmpty(memberData)
        ? {
            firstName: memberData?.firstName,
            lastName: memberData?.lastName,
            email: memberData?.email,
            allAssistant: memberData?.allAssistant,
          }
        : {
            allAssistant: true,
          },
    [memberData]
  );

  const getApiUrl = useCallback(
    (url) => {
      if (clinicId) {
        return `${url}?practice=${clinicId}`;
      }
      return url;
    },
    [clinicId]
  );

  const profileFormGroups = useMemo(
    () => [
      {
        inputType: 'text',
        name: 'firstName',
        textLabel: 'First Name',
        required: requiredField,
        gridProps: { md: 12 },
        maxLength: { ...inputLength.firstName },
        pattern: {
          value: regFirstname.value,
          message: `Firstname ${regFirstname?.message}`,
        },
      },
      {
        inputType: 'text',
        name: 'lastName',
        textLabel: 'Last Name',
        required: requiredField,
        gridProps: { md: 12 },
        maxLength: { ...inputLength.firstName },
        pattern: {
          value: regFirstname.value,
          message: `Lastname ${regFirstname?.message}`,
        },
      },
      {
        inputType: 'text',
        type: 'email',
        name: 'email',
        textLabel: 'Email Address',
        gridProps: { md: 12 },
        required: requiredField,
        pattern: regEmail,
      },
      ...(type === roleTypes.practitioner
        ? [
            {
              inputType: 'textLabel',
              text: 'Assistants who can manage this practitioner :',
              colSpan: 2,
            },
            {
              inputType: 'checkBox',
              name: 'allAssistant',
              label: 'All Assistants',
              colSpan: 0.5,
            },
            {
              ...WiredPractitionerField({
                name: type,
                label:
                  type === roleTypes.practitioner
                    ? 'Assistants'
                    : 'Practitioners',
                url:
                  type === roleTypes.practitioner
                    ? getApiUrl(API_URL.assistant)
                    : getApiUrl(API_URL.practitioner),
                extraId: 'practitioners',
                valueAccessor: 'id',
                multiple: true,
                labelAccessor: ['firstName', 'lastName'],
                fetchInitial: true,
                isOptionEqualToValue: (option, value) => option.id === value.id,
                dependencies: {
                  keys: ['allAssistant'],
                  calc: calcPractitionersDropDown,
                },
                addOnFilterKey:'assistants'
              }),
            },
          ]
        : []),
    ],
    [calcPractitionersDropDown, type]
  );
  const form = useForm({ mode: 'onChange' });

  const { handleSubmit, setValue } = form;

  useEffect(() => {
    if (!isEmpty(memberData)) {
      getSelectedMemberApi();
    }
  }, [getSelectedMemberApi, memberData, setValue, type]);

  useEffect(() => {
    if (!isEmpty(selectedMemberResponse)) {
      setValue(type, [...(selectedMemberResponse?.selectedMember || [])]);
    }
  }, [selectedMemberResponse]);

  useEffect(() => {
    if (!isEmpty(response)) {
      let message = '';
      if (isEmpty(memberData)) {
        message = successMessage.create;
      } else {
        message = successMessage.update;
      }
      showSnackbar({
        message,
        severity: 'success',
      });

      clear();
      modalCloseAction();
      triggerEvents(`REFRESH-TABLE-${TEAM_LIST}_${upperCase(type)}`);
    }
  }, [response]);

  useEffect(() => {
    clearSelectedMemberData(true);
    return () => {
      clearSelectedMemberData(true);
    };
  }, []);
  const handleSaveAccountDetails = useCallback(
    (data) => {
      // here we are getting the form values

      const selectedMem = data?.[type];
      if (type !== roleTypes.practitioner) {
        // eslint-disable-next-line no-param-reassign
        delete data.allAssistant;
      }
      // const ids = selectedMem?.map((x) => x?.id);

      if (isEmpty(memberData)) {
        // eslint-disable-next-line no-param-reassign
        delete data?.[type];
        const params = {
          ...data,
          team: selectedMem || [],
        };
        if (isSuperAdmin) {
          const newParams = { ...params, practice: clinicId };

          memberApi({ data: newParams });
        } else memberApi({ data: params });
      } else {
        const updatedFields = getUpdatedFieldsValue(data, memberData);
        const [addedMember, deletedMember] = getArrayDiff(
          selectedMemberResponse?.selectedMember,
          selectedMem
        );
        delete updatedFields?.[type];
        if (
          isEmpty(updatedFields) &&
          isEmpty(addedMember) &&
          isEmpty(deletedMember)
        )
          showSnackbar({
            message: 'No changes found',
            severity: 'error',
          });
        else {
          memberApi({ ...updatedFields, addedMember, deletedMember });
        }
      }
    },
    [
      memberApi,
      memberData,
      modalCloseAction,
      selectedMemberResponse?.selectedMember,
      type,
    ]
  );

  return (
    <Container
      component="main"
      style={{
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
      }}
    >
      <Stack
        spacing={0}
        sx={{
          height: '100%',
        }}
      >
        <Grid container sx={{ justifyContent: 'center', height: '100%' }}>
          <Grid
            xs={12}
            md={12}
            lg={12}
            sx={{
              height: '100%',
            }}
          >
            <Card
              display="flex"
              sx={{
                height: '100%',
                backgroundColor: palette.background.paper,
                boxShadow: 'none',
              }}
            >
              {!isEmpty(header) ? (
                <ModalHeader
                  header={header}
                  modalCloseAction={modalCloseAction}
                />
              ) : (
                <CardHeader title={title} />
              )}
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ marginTop: 0 }}>
                  <CustomForm
                    form={form}
                    formGroups={profileFormGroups}
                    defaultValue={formDefaultValues}
                  />
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: 'center' }}>
                <CustomButton
                  variant="secondary"
                  onClick={modalCloseAction}
                  label="Cancel"
                />
                <LoadingButton
                  loading={loading}
                  variant="contained"
                  onClick={handleSubmit(handleSaveAccountDetails)}
                  label="Save"
                />
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
};

export default AddTeamMember;
