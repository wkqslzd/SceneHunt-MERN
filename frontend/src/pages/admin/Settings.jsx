import React from 'react';
import { Tabs, Form, Input, Switch, Button, Card, message } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  SettingOutlined,
  BellOutlined,
} from '@ant-design/icons';

const Settings = () => {
  const handleSave = () => {
    message.success('Settings saved successfully!');
  };

  const items = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined />
          Profile
        </span>
      ),
      children: (
        <Card>
          <Form layout="vertical" onFinish={handleSave}>
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: 'Please enter your username!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Username" />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please enter your email!' },
                { type: 'email', message: 'Please enter a valid email address!' },
              ]}
            >
              <Input placeholder="Email" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Changes
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'security',
      label: (
        <span>
          <LockOutlined />
          Security
        </span>
      ),
      children: (
        <Card>
          <Form layout="vertical" onFinish={handleSave}>
            <Form.Item
              label="Current Password"
              name="currentPassword"
              rules={[{ required: true, message: 'Please enter your current password!' }]}
            >
              <Input.Password placeholder="Current Password" />
            </Form.Item>
            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[{ required: true, message: 'Please enter your new password!' }]}
            >
              <Input.Password placeholder="New Password" />
            </Form.Item>
            <Form.Item
              label="Confirm New Password"
              name="confirmPassword"
              rules={[
                { required: true, message: 'Please confirm your new password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm New Password" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Update Password
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined />
          Notifications
        </span>
      ),
      children: (
        <Card>
          <Form layout="vertical" onFinish={handleSave}>
            <Form.Item label="System Notifications" name="systemNotifications" valuePropName="checked">
              <Switch defaultChecked />
            </Form.Item>
            <Form.Item label="Comment Notifications" name="commentNotifications" valuePropName="checked">
              <Switch defaultChecked />
            </Form.Item>
            <Form.Item label="Update Notifications" name="updateNotifications" valuePropName="checked">
              <Switch defaultChecked />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Settings
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'system',
      label: (
        <span>
          <SettingOutlined />
          System
        </span>
      ),
      children: (
        <Card>
          <Form layout="vertical" onFinish={handleSave}>
            <Form.Item label="Site Title" name="siteTitle">
              <Input placeholder="Site Title" />
            </Form.Item>
            <Form.Item label="Site Description" name="siteDescription">
              <Input.TextArea placeholder="Site Description" />
            </Form.Item>
            <Form.Item label="Maintenance Mode" name="maintenanceMode" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Settings
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <div>
      <Tabs defaultActiveKey="profile" items={items} />
    </div>
  );
};

export default Settings; 