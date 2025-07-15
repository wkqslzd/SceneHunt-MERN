import React, { useState } from 'react';
import { Table, Space, Button, Tag, Modal, message } from 'antd';
import { UserOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const UserManagement = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  // TODO: Get actual data from API
  const users = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      role: 'Super Administrator',
      status: 'active',
      createdAt: '2024-05-08',
    },
    {
      id: 2,
      username: 'moderator',
      email: 'moderator@example.com',
      role: 'Administrator',
      status: 'active',
      createdAt: '2024-05-08',
    },
    {
      id: 3,
      username: 'user1',
      email: 'user1@example.com',
      role: 'User',
      status: 'inactive',
      createdAt: '2024-05-08',
    },
  ];

  const handleDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    // TODO: Implement actual delete logic
    message.success('User deleted successfully');
    setIsDeleteModalVisible(false);
    setSelectedUser(null);
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = 'blue';
        if (role === 'Super Administrator') color = 'gold';
        if (role === 'Administrator') color = 'green';
        return <Tag color={color}>{role}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => message.info('编辑功能开发中')}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => message.info('添加功能开发中')}>
          Add User
        </Button>
      </div>
      <Table columns={columns} dataSource={users} rowKey="id" />
      <Modal
        title="Confirm Delete"
        open={isDeleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
      >
        <p>Are you sure you want to delete user {selectedUser?.username}? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default UserManagement; 