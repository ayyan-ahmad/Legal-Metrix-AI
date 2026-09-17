import AdminNavbar from './AdminNavbar';

function AdminLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <AdminNavbar />
      <main
        style={{ maxWidth: '1100px', margin: '0 auto' }}
        className="px-4 py-5 sm:px-6 sm:py-8"
      >
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
