import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  return (
    <>
      <Header />
      <main style={{ minHeight: 'calc(100vh - 64px - 80px)' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
