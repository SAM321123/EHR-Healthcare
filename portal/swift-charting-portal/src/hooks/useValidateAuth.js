import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserRole } from 'src/lib/utils';

export default function useValidateAuth() {
  const navigate = useNavigate();
  useEffect(() => {
    const userData = getUserRole();
    if (userData) {
      navigate('/', { replace: true });
    }
  }, []);
}

// ----------------------------------------------------------------------
