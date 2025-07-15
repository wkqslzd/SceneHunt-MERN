import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Tag, message, Form, Input } from 'antd';
import api from '../../utils/api';

function UserManagementPanel({ modal }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [transferForm] = Form.useForm();
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (record) => {
    try {
      const action = record.role === 'admin' ? 'demote' : 'promote';
      await api.post(`/admin/users/${record.userID}/admin`, { action });
      message.success(`${record.username} is now ${record.role === 'admin' ? 'User' : 'Administrator'}`);
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error('Error toggling admin:', error);
      message.error('Failed to update user role');
    }
  };

  const showTransferModal = (user) => {
    setSelectedUser(user);
    setTransferModalVisible(true);
  };

  const handleTransferSuperAdmin = async (values) => {
    try {
      await api.post('/admin/super-admin/transfer', { 
        newSuperAdminId: selectedUser.userID,
        password: values.password
      });
      message.success(`Super Admin transferred to ${selectedUser.username}`);
      setTransferModalVisible(false);
      transferForm.resetFields();
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error('Error transferring super admin:', error);
      message.error(error.response?.data?.message || 'Failed to transfer super admin role');
    }
  };

  const handleDeleteUser = async (record) => {
    console.log('Delete user:', record);
    try {
      await api.delete(`/admin/users/${record.userID}`);
      message.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const mapRoleToDisplay = (role) => {
    switch(role) {
      case 'super_admin':
        return 'Super Administrator';
      case 'admin':
        return 'Administrator';
      default:
        return 'User';
    }
  };

  const columns = [
    { title: 'Username', dataIndex: 'username', key: 'username' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: role => (
        <Tag color={
          role === 'super_admin' ? 'red' :
          role === 'admin' ? 'blue' : 'default'
        }>
          {mapRoleToDisplay(role)}
        </Tag>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.role !== 'super_admin' && (
            <Button size="small" onClick={() => handleToggleAdmin(record)}>
              {record.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
            </Button>
          )}
          {record.role !== 'super_admin' && (
            <Button size="small" danger onClick={() => handleDeleteUser(record)}>
              Delete
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <>
      <Table 
        rowKey="userID" 
        columns={columns} 
        dataSource={users} 
        pagination={{ pageSize: 10 }}
        loading={loading}
      />
      
      <Modal
        title="Transfer Super Admin"
        open={transferModalVisible}
        onCancel={() => setTransferModalVisible(false)}
        footer={null}
      >
        <Form form={transferForm} onFinish={handleTransferSuperAdmin} layout="vertical">
          <p>Are you sure you want to transfer Super Admin role to {selectedUser?.username}?</p>
          <p>Please enter your current password to confirm:</p>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password placeholder="Your current password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" danger>
              Confirm Transfer
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => setTransferModalVisible(false)}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

const SuperAdmin = () => {
  const [modal, contextHolder] = Modal.useModal();

  return (
    <Card>
      {contextHolder}
          <UserManagementPanel modal={modal} />
    </Card>
  );
};

export default SuperAdmin;
