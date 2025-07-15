import { List, Button, Tag, Space, Modal, message } from 'antd';
import { useState, useEffect } from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function UserPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPosts([
        {
          id: 1,
          title: '测试文章1',
          status: 'published',
          createTime: '2024-03-20',
          likes: 10,
          comments: 5
        },
        {
          id: 2,
          title: '测试文章2',
          status: 'draft',
          createTime: '2024-03-19',
          likes: 0,
          comments: 0
        }
      ]);
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这篇文章吗？此操作不可恢复。',
      onOk: async () => {
        try {
          // Simulate API calls
          await new Promise(resolve => setTimeout(resolve, 1000));
          message.success('删除成功');
          loadPosts(); // Reload the list
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  return (
    <List
      loading={loading}
      itemLayout="vertical"
      dataSource={posts}
      renderItem={item => (
        <List.Item
          actions={[
            <Space>
              <Button 
                type="link" 
                icon={<EditOutlined />}
                onClick={() => navigate(`/post/edit/${item.id}`)}
              >
                编辑
              </Button>
              <Button 
                type="link" 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(item.id)}
              >
                删除
              </Button>
            </Space>
          ]}
          extra={
            <Space>
              <Tag color={item.status === 'published' ? 'green' : 'orange'}>
                {item.status === 'published' ? '已发布' : '草稿'}
              </Tag>
              <span>点赞 {item.likes}</span>
              <span>评论 {item.comments}</span>
            </Space>
          }
        >
          <List.Item.Meta
            title={<a onClick={() => navigate(`/post/${item.id}`)}>{item.title}</a>}
            description={`发布时间：${item.createTime}`}
          />
        </List.Item>
      )}
    />
  );
} 