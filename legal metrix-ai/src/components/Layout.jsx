import Navbar from './Navbar';

function Layout({ children }) {
  return (
    <div>
      <Navbar />
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  );
}

export default Layout;