import { Form, Input, Button, Card, message, Modal, Select, DatePicker, Radio } from 'antd';
import { UserOutlined, LockOutlined, SmileOutlined, PictureOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer not to say', label: 'Prefer not to say' },
];

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [registerVisible, setRegisterVisible] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register, isAuthenticated, user } = useAuth();

  // If the user is already logged in, redirect to the homepage
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin' || user?.role === 'super_admin') {
        navigate('/admin/profile');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Login form submission
  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log('Attempting login with:', values.username);
      const user = await login(values.username, values.password);
      console.log('Login successful:', user);
      
      message.success('Login successful');

      // Redirect to the homepage
      navigate('/');
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      message.error(error.response?.data?.message || 'Login failed, please try again');
    } finally {
      setLoading(false);
    }
  };

  // Register form submission
  const onRegister = async (values) => {
    setRegisterLoading(true);
    try {
      values.nickname = values.nickname.trim();
      if (!values.avatar) values.avatar = 'default-avatar.png';
      if (values.birthDate?.format) {
        values.birthDate = values.birthDate.format('YYYY-MM-DD');
      }

      const user = await register(values);
      console.log('Registration successful:', user);

      message.success('Registration successful!');
      setRegisterVisible(false);
      
      // Redirect to the homepage
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      message.error(error.response?.data?.message || 'Registration failed, please try again');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' }}>
      <Card style={{ width: 400 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 30 }}>User Login</h2>
        <Form name="login" onFinish={onFinish} autoComplete="off" layout="vertical">
          <Form.Item name="username" rules={[{ required: true, message: 'Please enter your username' }]}>
            <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Please enter your password' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Login
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <a style={{ color: '#facc15', cursor: 'pointer' }} onClick={() => setRegisterVisible(true)}>
              No account? Register now
            </a>
          </div>
        </Form>
      </Card>

      {/* Register modal */}
      <Modal
        open={registerVisible}
        onCancel={() => setRegisterVisible(false)}
        footer={null}
        title="User Registration"
        destroyOnClose
      >
        <Form name="register" onFinish={onRegister} autoComplete="off" layout="vertical">
          <Form.Item name="username" rules={[
            { required: true, message: 'Please enter your username' },
            { pattern: /^[a-zA-Z0-9]+$/, message: 'Only letters and numbers allowed' }
          ]}>
            <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
          </Form.Item>

          <Form.Item name="password" rules={[
            { required: true, message: 'Please enter your password' },
            { min: 6, message: 'Password must be at least 6 characters' }
          ]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>

          <Form.Item name="confirm" dependencies={['password']} rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match'));
              },
            }),
          ]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" size="large" />
          </Form.Item>

          <Form.Item name="nickname" rules={[{ required: true, message: 'Please enter your nickname' }]}>
            <Input prefix={<SmileOutlined />} placeholder="Nickname" size="large" />
          </Form.Item>

          <Form.Item name="gender" rules={[{ required: true, message: 'Please select your gender' }]}>
            <Select options={genderOptions} placeholder="Gender" size="large" />
          </Form.Item>

          <Form.Item name="birthDate" rules={[{ required: true, message: 'Please select your birth date' }]}>
            <DatePicker style={{ width: '100%' }} size="large" />
          </Form.Item>

          <Form.Item name="bio" rules={[{ max: 150, message: 'Up to 150 characters' }]}>
            <Input.TextArea rows={3} maxLength={150} showCount placeholder="Bio (optional)" />
          </Form.Item>

          <Form.Item name="avatar" initialValue="https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png"
            rules={[{ required: true, message: 'Please select an avatar' }]}>
            <Radio.Group style={{ width: '100%' }}>
              <Radio value="https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png">
                <img src="https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png" alt="Pikachu" style={{ width: 48, height: 48, borderRadius: '50%', marginRight: 8 }} />
                Pikachu
              </Radio>
              <Radio value="https://assets.pokemon.com/assets/cms2/img/pokedex/full/007.png">
                <img src="https://assets.pokemon.com/assets/cms2/img/pokedex/full/007.png" alt="Squirtle" style={{ width: 48, height: 48, borderRadius: '50%', marginRight: 8 }} />
                Squirtle
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={registerLoading} block size="large">
              Register
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <a style={{ color: '#1890ff', cursor: 'pointer' }} onClick={() => setRegisterVisible(false)}>
              Already have an account? Login
            </a>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
