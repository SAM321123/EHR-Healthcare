import { Box, Button, Card, CardContent, Checkbox, Select } from '@mui/material';
import useQuery from 'src/hooks/useQuery';
import React, { useCallback, useEffect, useState } from 'react'
import { API_URL, REQUEST_METHOD } from 'src/api/constants';
import { ROLE_AND_MODULES_DATA, ROLE_AND_PERMISSIONS } from 'src/store/types';
import WiredSelect from 'src/wiredComponent/Select';
import LoadingButton from 'src/components/CustomButton/loadingButton';
import { useForm } from 'react-hook-form';
import CustomForm from 'src/components/form';
import CardActions from '@mui/material/CardActions';
import { WiredMasterField } from "src/wiredComponent/Form/FormFields";
import { requiredField, successMessage } from "src/lib/constants";
import useCRUD from 'src/hooks/useCRUD';
import { isEmpty } from 'lodash';
import { getUpdatedFieldsValues, showSnackbar } from 'src/lib/utils';

const RoleAndPermissions = () => {    
    const form = useForm({ mode: 'onChange' });
    const { handleSubmit, watch } = form;
    const [defaultData, setDefaultData] = useState(null);

    const roleAndPermissionFormGroups = [
        {
            ...WiredMasterField({
              url: API_URL.role,
              filter: { limit: 20 },
              name: 'roleId',
              label: 'Role',
              labelAccessor: 'name',
              valueAccessor: 'id',
              colSpan: 0.5,
              placeholder: 'Select the Role',
              cache: false,
            }),
        },
      ];

    const [dynamicFormGroups, setDynamicFormGroups] = React.useState([]);
    const roleId = watch('roleId');
    const [roleAndPermissions, , roleAndPermissionsLoading, callRoleAndPermissionsSaveAPI, clearData] = useCRUD({
      id: ROLE_AND_PERMISSIONS,
      url: `${API_URL.roleAndPermissions}/${roleId}`,
      type: isEmpty(defaultData) ? REQUEST_METHOD.post : REQUEST_METHOD.update,
    });
      
    const [roleAndPermissionsData, , roleAndPermissionsDataLoading, callRoleAndPermissionsDataSaveAPI, roleAndPermissionsClearData] = useCRUD({
      id: ROLE_AND_PERMISSIONS,
      url: `${API_URL.roleAndPermissions}/${roleId}`,
      type: REQUEST_METHOD.get,
    });
    
    const [roleAndModules, , loading, callRoleAndModulesSaveAPI, roleAndModulesClearData] = useCRUD({
      id: ROLE_AND_MODULES_DATA,
      url: `${API_URL.roleAndModules}/${roleId}`,
      type: REQUEST_METHOD.get,
    });
    
    // Trigger APIs on roleId change
    useEffect(() => {
      if (roleId) {
        setDefaultData(null);
        form.reset({ roleId }); // reset only, preserve roleId
        setDynamicFormGroups([]);
        callRoleAndModulesSaveAPI();
        callRoleAndPermissionsDataSaveAPI();
      }
    }, [roleId]);

    useEffect(() => {
      return () => {roleAndModulesClearData(true) 
        roleAndPermissionsClearData(true)};
    },[])

      useEffect(()=> {
        if(roleId){
          callRoleAndModulesSaveAPI();
          callRoleAndPermissionsDataSaveAPI();
        }
      }, [roleId])

      useEffect(() => {
        if(roleId){
          setDefaultData(roleAndPermissionsData);
        }
    }, [roleAndPermissionsData])  

    useEffect(() => {
        const newFormGroups = roleAndModules?.map((module) => {
           const obj = {
               inputType: 'multiChoice',
               name: `${module?.module?.id}`,
               textLabel: `${module?.module?.name}`,
               options: module?.module?.permissions?.map((permission) => ({ label: `${permission?.name}`, value: `${permission?.id}` })),
               gridProps: { md: 4 },
           }
           return obj; 
        }) 
        if(newFormGroups)
        setDynamicFormGroups(newFormGroups);
    }, [roleAndModules]);
    

    const finalFormGroups = [...roleAndPermissionFormGroups, ...dynamicFormGroups];

    const onHandleSubmit = useCallback(
        (data) => {
          const isDefaultDataEmpty = isEmpty(defaultData);
          let payload = {};
          if (isDefaultDataEmpty) {
            payload = data;
          } else {
            const updatedFields = getUpdatedFieldsValues(data, defaultData);
            if (!isEmpty(updatedFields)) {
              payload = updatedFields;
            }
          }
          if (isEmpty(payload)) {
            showSnackbar({
              message: 'No changes found',
              severity: 'error',
            });
            return;
          }
          
          delete payload.roleId;
          if (isDefaultDataEmpty) {
            callRoleAndPermissionsSaveAPI({ data: { ...payload } });
          } else {
            callRoleAndPermissionsSaveAPI( { ...payload });
          }
        },
        [callRoleAndPermissionsSaveAPI, defaultData]
      );
      

      useEffect(() => {
        if (!isEmpty(roleAndPermissions)) {
          showSnackbar({
            message: isEmpty(defaultData)
              ? successMessage.create
              : successMessage.update,
            severity: 'success',
          });
          clearData(true);
          // refetchData();
          // modalCloseAction();
        }
      }, [roleAndPermissions, defaultData, clearData]);

      return (
        <Card>
            <Box>
                <CardContent>
                    <CustomForm
                        form={form}
                        formGroups={finalFormGroups}
                        columnsPerRow={1}
                        defaultValue={isEmpty(defaultData) ? {} : defaultData}
                        resetOnDefaultValue={true}
                    />
                </CardContent>
                <CardActions
                    sx={{
                        justifyContent: 'flex-start',
                        paddingLeft: '24px',
                        paddingRight: '24px',
                    }}
                >
                  {roleAndModules && (
                    <LoadingButton
                      loading={loading}
                      onClick={handleSubmit(onHandleSubmit)}
                      label="Save"
                    />
                  )}
                </CardActions>
            </Box>
        </Card>
    )
}

export default RoleAndPermissions;
