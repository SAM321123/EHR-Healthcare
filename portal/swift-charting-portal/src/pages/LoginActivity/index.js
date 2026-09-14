import { Route, Routes } from 'react-router-dom';
import LoginActivityTable from './LoginActivityTable';

const LoginActivity = () => (
  <Routes>
    <Route path="/" element={<LoginActivityTable />} />
  </Routes>
);
export default LoginActivity;
