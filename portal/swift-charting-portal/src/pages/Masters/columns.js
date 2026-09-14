import { API_URL } from 'src/api/constants';
import Switch from 'src/wiredComponent/Switch';

const columns = [
  {
    label: 'Name',
    type: 'text',
    dataKey: 'name',
    sort: true,
  },
  {
    label: 'Description',
    dataKey: 'description',
    type: 'text',
  },
  {
    label: 'Status',
    dataKey: 'isActive',
    type: 'boolean',
    render: ({ data }) => <Switch rowData={data} api={API_URL.saveMasters} />,
  },
];

export default columns;
