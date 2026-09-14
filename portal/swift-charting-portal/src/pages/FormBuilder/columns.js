import { API_URL } from 'src/api/constants';
import Switch from 'src/wiredComponent/Switch';

const FormColumns = [
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
    label: 'Status',
    dataKey: 'isActive',
    type: 'boolean',
    activeData: 'Active',
    inActiveData: 'InActive',
    render: ({ data }) => <Switch rowData={data} api={API_URL.saveForm} />,
  },
];

export default FormColumns;
