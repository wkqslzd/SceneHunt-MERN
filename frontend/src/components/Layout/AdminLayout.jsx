import React from 'react';
import { Menu } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const getLevel = (role) => {
  switch (role) {
    case 'super_admin': return 3;
    case 'admin': return 2;
    case 'user': return 1;
    default: return 0;
  }
};

const sidebarStyle = {
  height: '100%',
  minHeight: 'calc(100vh - 64px)',
  background: '#181818',
  color: '#fff',
  padding: '32px 0 0 0',
  borderRight: '1px solid #222',
  fontSize: 18
};

const contentStyle = {
  background: '#fff',
  minHeight: 'calc(100vh - 64px)',
  padding: '32px',
  borderRadius: 8,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
};

const menuItemStyle = {
  height: 56,
  display: 'flex',
  alignItems: 'center',
  fontWeight: 500,
  fontSize: 18
};

const AdminLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const level = getLevel(user?.role);

  const menuItems = [
    level >= 1 && {
      key: '/admin/profile',
      label: 'Profile'
    },
    level >= 2 && {
      key: '/admin/admin2',
      label: 'Admin'
    },
    level >= 3 && {
      key: '/admin/superadmin',
      label: 'Super Admin'
    }
  ].filter(Boolean);

  const handleMenuClick = (e) => {
    if (!menuItems.find(item => item.key === e.key)?.disabled) {
      navigate(e.key);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      {/* Left sidebar */}
      <div style={sidebarStyle}>
        <Menu
          mode="vertical"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          style={{ background: 'transparent', borderRight: 0 }}
          items={menuItems.map(item => ({
            ...item,
            style: menuItemStyle
          }))}
          theme="dark"
        />
      </div>
      {/* Ri */}
      <div style={{ flex: 1, ...contentStyle }}>
          <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
