import Container from 'src/components/Container';
import useAuthUser from 'src/hooks/useAuthUser';
import ShowPatientActivityLog from './TopCard';

const Home = () => {
  const [userData] = useAuthUser();

  return (
    <Container
      component="main"
      style={{
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
      }}
    >
      <ShowPatientActivityLog patientId={userData?.id} />
    </Container>
  );
};

export default Home;
