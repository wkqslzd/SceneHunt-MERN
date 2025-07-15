import { List, Button, Modal, message } from 'antd';
import { useState, useEffect } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function UserComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      setComments([
        {
          id: 1,
          content: '这是一条测试评论1',
          postTitle: '测试文章1',
          postId: 1,
          createTime: '2024-03-20',
          likes: 5
        },
        {
          id: 2,
          content: '这是一条测试评论2',
          postTitle: '测试文章2',
          postId: 2,
          createTime: '2024-03-19',
          likes: 3
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
      content: '确定要删除这条评论吗？',
      onOk: async () => {
        try {
          // Simulate API calls
          await new Promise(resolve => setTimeout(resolve, 1000));
          message.success('删除成功');
          loadComments(); // Reload the list
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
      dataSource={comments}
      renderItem={item => (
        <List.Item
          actions={[
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(item.id)}
            >
              删除
            </Button>
          ]}
          extra={
            <span>获得点赞 {item.likes}</span>
          }
        >
          <List.Item.Meta
            title={
              <span>
                评论于文章：
                <a onClick={() => navigate(`/post/${item.postId}`)}>
                  {item.postTitle}
                </a>
              </span>
            }
            description={`评论时间：${item.createTime}`}
          />
          {item.content}
        </List.Item>
      )}
    />
  );
} 