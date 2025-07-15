import { Card, Tabs, Avatar, Button, Form, Input, Upload, message, Radio } from 'antd';
import { UserOutlined, UploadOutlined, EditOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import UserPosts from './UserPosts';
import UserComments from './UserComments';
import UserLikes from './UserLikes';
import axios from 'axios';

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user: authUser, updateUser } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState(authUser?.avatar || 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png');

  // Listen for changes in authUser.avatar and automatically sync selectedAvatar
  useEffect(() => {
    if (authUser?.avatar) {
      setSelectedAvatar(authUser.avatar);
    }
  }, [authUser?.avatar]);

  const presetAvatars = [
    'https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png',
    'https://assets.pokemon.com/assets/cms2/img/pokedex/full/007.png'
  ];

  const handleSave = async (values) => {
    setLoading(true);
    try {
      const dataToSend = {
        ...values,
        avatar: selectedAvatar
      };
      const response = await axios.put('/api/users/profile', dataToSend);
      message.success('Profile updated successfully');
      updateUser(response.data);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: 'posts',
      label: 'My Posts',
      children: <UserPosts />,
    },
    {
      key: 'comments',
      label: 'My Comments',
      children: <UserComments />,
    },
    {
      key: 'likes',
      label: 'My Likes',
      children: <UserLikes />,
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <Avatar size={64} src={authUser?.avatar} icon={<UserOutlined />} />
          <div style={{ marginLeft: 24, flex: 1 }}>
            {editing ? (
              <>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <Radio.Group
                    value={selectedAvatar}
                    onChange={e => setSelectedAvatar(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    {presetAvatars.map((url) => (
                      <Radio key={url} value={url}>
                        <img
                          src={url}
                          alt="avatar"
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            border: selectedAvatar === url ? '2px solid #facc15' : '2px solid #eee',
                            marginRight: 8
                          }}
                        />
                      </Radio>
                    ))}
                  </Radio.Group>
                </div>
                <Form
                  onFinish={handleSave}
                  initialValues={{
                    nickname: authUser?.nickname,
                    bio: authUser?.bio
                  }}
                  layout="vertical"
                >
                  <Form.Item
                    name="nickname"
                    label="Nickname"
                    rules={[{ required: true, message: 'Please input your nickname!' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="bio"
                    label="Bio"
                  >
                    <Input.TextArea rows={3} />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      Save
                    </Button>
                    <Button style={{ marginLeft: 8 }} onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  </Form.Item>
                </Form>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <h2 style={{ margin: 0 }}>{authUser?.nickname || authUser?.username}</h2>
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => setEditing(true)}
                  >
                    Edit Profile
                  </Button>
                </div>
                <p style={{ color: '#666', margin: '8px 0' }}>
                  {authUser?.bio || 'No bio yet'}
                </p>
              </>
            )}
          </div>
        </div>
        <Tabs items={items} />
      </Card>
    </div>
  );
} 