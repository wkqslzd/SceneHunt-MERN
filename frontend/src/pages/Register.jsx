import { Form, Input, Button, Card, message, Select, DatePicker } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, SmileOutlined, PictureOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { registerApi } from '../api/user'; // TODO: Back-end API integration

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer not to say', label: 'Prefer not to say' },
];

export default function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      values.nickname = values.nickname.trim();
      if (!values.avatar) values.avatar = 'default-avatar.png';
      if (values.birthDate && values.birthDate.format) {
        values.birthDate = values.birthDate.format('YYYY-MM-DD');
      }
      // TODO: Call the backend registration API
      // const res = await registerApi(values);
      // if (res && res.data && res.data.user) {
      //   localStorage.setItem('token', res.data.token);
      //   localStorage.setItem('user', JSON.stringify(res.data.user));
      //   message.success('Registration successful!');
      //   navigate('/profile/posts');
      //   return;
      // }
      // --- mock successful logic ---
      const mockUser = {
        userID: 'mock-uuid',
        username: values.username,
        nickname: values.nickname,
        avatar: values.avatar,
        role: 'user',
      };
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      message.success('Registration successful!');
      navigate('/admin/adminprofile');
    } catch (error) {
      // TODO: Handle the error returned by the backend
      message.error('Registration failed, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: '#f0f2f5' 
    }}>
      <Card style={{ width: 400 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 30 }}>User Registration</h2>
        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Please enter your username' },
              { pattern: /^[a-zA-Z0-9]+$/, message: 'Only letters and numbers allowed' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Username" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="nickname"
            rules={[{ required: true, message: 'Please enter your nickname' }]}
          >
            <Input 
              prefix={<SmileOutlined />} 
              placeholder="Nickname" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="gender"
            rules={[{ required: true, message: 'Please select your gender' }]}
          >
            <Select
              options={genderOptions}
              placeholder="Gender"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="birthDate"
            rules={[{ required: true, message: 'Please select your birth date' }]}
          >
            <DatePicker style={{ width: '100%' }} size="large" />
          </Form.Item>

          <Form.Item
            name="bio"
            rules={[{ max: 150, message: 'Up to 150 characters' }]}
          >
            <Input.TextArea rows={3} maxLength={150} showCount placeholder="Bio (optional)" />
          </Form.Item>

          <Form.Item
            name="avatar"
          >
            <Input 
              prefix={<PictureOutlined />} 
              placeholder="Avatar URL (optional)" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              size="large"
            >
              Register
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center' }}>
            <a onClick={() => navigate('/login')}>Already have an account? Login now</a>
          </div>
        </Form>
      </Card>
    </div>
  );
}