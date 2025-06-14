import PropTypes from 'prop-types';
import Sidebar from './Sidebar';

const DashboardLayout = ({ userRole, userName, userEmail }) => {
  return (
    <div className="min-h-screen bg-gray-100"> {/* Retirez les props ici */}
      <Sidebar 
        userRole={userRole}
        userName={userName}
        userEmail={userEmail}
      />
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
};

// Ajoutez la validation des props
DashboardLayout.propTypes = {
  userRole: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  userEmail: PropTypes.string.isRequired
};