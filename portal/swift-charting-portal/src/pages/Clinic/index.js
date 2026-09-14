import { Route, Routes } from 'react-router-dom';
import ClinicDetails from './ClinicDetails';
import ClinicTable from './ClinicTable';

const Clinic = () => (
  <Routes>
    <Route path="/" element={<ClinicTable />} />
    <Route path="/edit/:clinicId/:tabName" element={<ClinicDetails />} />
  </Routes>
);
export default Clinic;
