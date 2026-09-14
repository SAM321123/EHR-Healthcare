import { appointmentStatusCode, dateFormats, roleTypes } from "src/lib/constants";
import { convertWithTimezone, getUserRole } from "src/lib/utils";
import { Permissions } from 'src/utils/permissions';


export function appointmentJoinButtonCondition(data) {
    const currentDateTime = new Date();
    const date = convertWithTimezone(
        data?.startDateTime,
        { format: dateFormats.MMDDYYYYhhmmA }
      )
    const startDateTime = new Date(date)

    const isStartDateTimePassed = currentDateTime < startDateTime;

    const isDisable=(!(data?.statusCode === appointmentStatusCode.CONFIRMED || data?.statusCode === appointmentStatusCode.ONGOING) || isStartDateTimePassed)
    return isDisable;
  }


export function getModulePermisions(data) {
  const {moduleName,userData} = data;
  const userRole = getUserRole()

  let isCreate = true;
  let isDelete = true;
  let isUpdate = true;
  let isRead = true;
  let isShare = true;
  let isPrint = true;

  if(userData && (userRole !== roleTypes.superAdmin && userRole !== roleTypes.clinicAdmin)){
    const modulePermissions = userData?.permission;
    const modulePermissionsArray = modulePermissions[moduleName]?.permission;

    // if(userRole !== roleTypes.superAdmin && userRole !== roleTypes.clinicAdmin){
      if(!modulePermissionsArray?.includes(Permissions.CREATE))
        isCreate = false;
      if(!modulePermissionsArray?.includes(Permissions.DELETE))
        isDelete = false;
      if(!modulePermissionsArray?.includes(Permissions.EDIT))
        isUpdate = false;
      if(!modulePermissionsArray?.includes(Permissions.READ))
        isRead = false;
      if(!modulePermissionsArray?.includes(Permissions.PRINT))
        isPrint = false;
      if(!modulePermissionsArray?.includes(Permissions.SHARE))
        isShare = false;
    // }
  }

  return ({isCreate, isDelete, isUpdate, isRead, isPrint, isShare});
 
}  
  