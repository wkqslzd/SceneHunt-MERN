import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Select, DatePicker, message, Row, Col, Divider, Avatar, Descriptions, Space, Radio, Upload } from 'antd';
import { UserOutlined, LockOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'antd';

const { Option } = Select;

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer not to say', label: 'Prefer not to say' },
];

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

const Profile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png');
  const [showPwd, setShowPwd] = useState(false);
  const { user: authUser, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const level = getLevel(authUser?.role);

  // Sidebar menu items
  const menuItems = [
    {
      key: '/admin/profile',
      label: 'Profile',
      disabled: level < 1
    },
    {
      key: '/admin/admin2',
      label: 'Admin',
      disabled: level < 2
    },
    {
      key: '/admin/superadmin',
      label: 'Super Admin',
      disabled: level < 3
    }
  ];

  // Get user information
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/users/profile');
      const userData = response.data;
      
      // Set form initial values
      form.setFieldsValue({
        username: userData.username,
        nickname: userData.nickname,
        gender: userData.gender,
        birthDate: userData.birthDate ? dayjs(userData.birthDate) : null,
        bio: userData.bio,
        avatar: userData.avatar
      });

      setAvatarUrl(userData.avatar || 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      message.error('Failed to load user profile');
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Update user information
  const handleUpdateProfile = async (values) => {
    setLoading(true);
    try {
      const dataToSend = {
        ...values,
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null
      };
      const response = await axios.put('/api/users/profile', dataToSend);
      message.success('Profile updated successfully');
      // Debug output
      console.log('Updated user information', response.data);
      // Ensure avatar is the latest
      updateUser({ ...authUser, avatar: dataToSend.avatar, ...response.data });
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // update password
  const handleUpdatePassword = async (values) => {
    setLoading(true);
    try {
      await axios.put('/api/users/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      message.success('Password updated successfully');
      setShowPwd(false);
      form.setFieldsValue({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      message.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  // Handle the upload of avatars
  const handleAvatarChange = async (info) => {
    if (info.file.status === 'done') {
      const newAvatarUrl = info.file.response.imageUrl;
      setAvatarUrl(newAvatarUrl);
      form.setFieldsValue({ avatar: newAvatarUrl });
      // Do not save automatically here
      // Only save when clicking Update Profile
    } else if (info.file.status === 'error') {
      message.error('Failed to upload avatar');
    }
  };

  // Sidebar click switch
  const handleMenuClick = (e) => {
    if (!menuItems.find(item => item.key === e.key)?.disabled) {
      navigate(e.key);
    }
  };

  return (
    <>
      <Card variant="outlined">
      <Row gutter={32}>
        <Col xs={24} md={8}>
            <Card variant="outlined" style={{ textAlign: 'center' }}>

              <Avatar size={96} src={avatarUrl} icon={<UserOutlined />} />
              <div style={{ marginTop: 16 }}>
                <Radio.Group
                  value={avatarUrl}
                  onChange={e => {
                    const newAvatarUrl = e.target.value;
                    setAvatarUrl(newAvatarUrl);
                    form.setFieldsValue({ avatar: newAvatarUrl });
                    // Do not save automatically here
                    // Only save when clicking Update Profile
                  }}
                  style={{ width: '100%' }}
                >
                  <Radio value="https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png">
                    <img src="https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png" alt="Pikachu" style={{ width: 48, height: 48, borderRadius: '50%', border: avatarUrl.includes('025') ? '2px solid #facc15' : '2px solid #eee', marginRight: 8 }} />
                  </Radio>
                  <Radio value="https://assets.pokemon.com/assets/cms2/img/pokedex/full/007.png">
                    <img src="https://assets.pokemon.com/assets/cms2/img/pokedex/full/007.png" alt="Squirtle" style={{ width: 48, height: 48, borderRadius: '50%', border: avatarUrl.includes('007') ? '2px solid #facc15' : '2px solid #eee', marginRight: 8 }} />
                  </Radio>
                </Radio.Group>
              </div>
              <Divider />
              <Descriptions column={1} size="small">

                <Descriptions.Item label="User ID">{authUser?.userID}</Descriptions.Item>
                <Descriptions.Item label="Rating Count">{authUser?.ratingCount}</Descriptions.Item>
                <Descriptions.Item label="Connection Count">{authUser?.connectionCount}</Descriptions.Item>
                <Descriptions.Item label="Created At">{authUser?.createdAt}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} md={16}>
              <Form
                form={form}
                layout="vertical"
              onFinish={handleUpdateProfile}
                initialValues={{
                username: authUser?.username,
                nickname: authUser?.nickname,
                gender: authUser?.gender,
                birthDate: authUser?.birthDate ? dayjs(authUser.birthDate) : null,
                bio: authUser?.bio,
                avatar: authUser?.avatar
              }}
              >
                <Form.Item
                name="username"
                  label="Username"
                rules={[{ required: true, message: 'Please input your username!' }]}
                >
                <Input prefix={<UserOutlined />} disabled />
                </Form.Item>

                <Form.Item
                name="nickname"
                  label="Nickname"
                rules={[{ required: true, message: 'Please input your nickname!' }]}
                >
                <Input prefix={<UserOutlined />} />
                </Form.Item>

                <Form.Item
                name="gender"
                  label="Gender"
                rules={[{ required: true, message: 'Please select your gender!' }]}
                >
                <Select>
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                  <Option value="other">Other</Option>
                  <Option value="prefer not to say">Prefer not to say</Option>
                </Select>
                </Form.Item>

                <Form.Item
                name="birthDate"
                  label="Birth Date"
                rules={[{ required: true, message: 'Please select your birth date!' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                name="bio"
                  label="Bio"
              >
                <Input.TextArea rows={4} />
              </Form.Item>

              <Form.Item
                name="avatar"
                label="Avatar"
              >
                <Upload
                  name="avatar"
                  listType="picture"
                  showUploadList={false}
                  action="/api/upload/avatar"
                  onChange={handleAvatarChange}
                  beforeUpload={(file) => {
                    const isImage = file.type.startsWith('image/');
                    if (!isImage) {
                      message.error('You can only upload image files!');
                      return false;
                    }
                    const isLt5M = file.size / 1024 / 1024 < 5;
                    if (!isLt5M) {
                      message.error('Image must be smaller than 5MB!');
                      return false;
                    }
                    return true;
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      style={{ width: 100, height: 100, borderRadius: '50%', marginBottom: 8 }}
                    />
                    <Button icon={<UploadOutlined />}>Change Avatar</Button>
                  </div>
                </Upload>
                </Form.Item>

                <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Update Profile
                </Button>
                <Button
                  type="link"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{ marginLeft: 8 }}
                >
                  {showPwd ? 'Cancel' : 'Change Password'}
                </Button>
                </Form.Item>
              </Form>
        </Col>
      </Row>

      {showPwd && (
          <Card title="Change Password" variant="outlined" style={{ maxWidth: 400, margin: '32px auto' }}>
            <Form layout="vertical" onFinish={handleUpdatePassword}>
              <Form.Item
                name="currentPassword"
                label="Current Password"
                rules={[{ required: true, message: 'Please input your current password!' }]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>

            <Form.Item
                name="newPassword"
              label="New Password"
              rules={[
                  { required: true, message: 'Please input your new password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
                <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item
                name="confirmPassword"
              label="Confirm New Password"
                dependencies={['newPassword']}
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
                <Input.Password prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item style={{ textAlign: 'right' }}>
              <Space>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Update Password
                  </Button>
                <Button onClick={() => setShowPwd(false)}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )}
    </Card>
    </>
  );
};

export default Profile;
