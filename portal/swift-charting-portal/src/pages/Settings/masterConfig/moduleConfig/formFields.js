import { regexCustomText, requiredField } from "src/lib/constants";
import { WiredMasterField, WiredSelect } from "src/wiredComponent/Form/FormFields";
import { AUTH_MODULE } from "src/api/constants";

export const moduleFormGroups = [
    // {
    //   inputType: 'text',
    //   type: 'text',
    //   name: 'name',
    //   required: requiredField,
    //   textLabel: 'Name',
    //   pattern: regexCustomText,
    // },
    // {
    //     inputType: 'wiredSelect',
    //     name: 'exercise',
    //     label: 'Exercise',
    //     required: requiredField,
    //     valueAccessor: 'id',
    //     labelAccessor: 'exercise',
    //     options: AUTH_MODULE,
    // },
    {
      ...WiredSelect({
        name: 'name',
        label: 'Name',
        required: requiredField,
        valueAccessor: 'value',
        labelAccessor: 'name',
        options: Object.keys(AUTH_MODULE).map(key => ({
          name: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
          value: AUTH_MODULE[key]
        })).sort((a, b) => a.name.localeCompare(b.name))
      }),
    },
    {
      inputType: 'text',
      type: 'text',
      name: 'route',
      required: requiredField,
      textLabel: 'Route',
      pattern: regexCustomText,
    },
    {
      ...WiredMasterField({
        code: 'permissions',
        filter: { limit: 20 },
        name: 'permissionIds',
        label: 'Permissions',
        labelAccessor: 'name',
        valueAccessor: 'id',
        required: requiredField,
        placeholder: 'Select',
        cache: false,
        multiple: true
      }),
    },
    {
        inputType: 'textArea',
        name: 'description',
        textLabel: 'Description',
        pattern: regexCustomText,
        colSpan: 1,
        // required: requiredField,
    },
  ];