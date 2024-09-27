import LoggedIn from './components/LoggedIn';
import LandingPage from './components/LandingPage';

// TODO: Replace with actual authentication logic
// change this to false to see landing page
const isLoggedIn = true;

export default function Home() {
  return isLoggedIn ? <LoggedIn /> : <LandingPage />;
}
