import { useEffect } from 'react';
import {
  generatePath,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import useAuthUser from 'src/hooks/useAuthUser';
import { UI_ROUTES } from 'src/lib/routeConstants';
import ClinicDetails from './ClinicDetails';

const ClinicAdmin = () => {
  const navigate = useNavigate();
  const [userData] = useAuthUser();
  const location = useLocation();

  useEffect(() => {
    if (userData && location?.pathname.indexOf(userData?.practice?.id) < 0) {
      navigate(
        generatePath(UI_ROUTES.editClinicDetails, {
          clinicId: userData?.id,
          tabName: 'Overview',
        })
      );
    }
  }, [location?.pathname]);

  return (
    <Routes>
      <Route
        path="/edit/:clinicId/:tabName"
        element={<ClinicDetails routingPath={UI_ROUTES.editClinicDetails} />}
      />
    </Routes>
  );
};

export default ClinicAdmin;
