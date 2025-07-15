import { List, Button, message } from 'antd';
import { useState, useEffect } from 'react';
import { LikeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function UserLikes() {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadLikes();
  }, []);

  const loadLikes = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLikes([
        {
          id: 1,
          postId: 1,
          postTitle: '测试文章1',
          author: '用户A',
          createTime: '2024-03-20',
          totalLikes: 10
        },
        {
          id: 2,
          postId: 2,
          postTitle: '测试文章2',
          author: '用户B',
          createTime: '2024-03-19',
          totalLikes: 15
        }
      ]);
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlike = async (id) => {
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('已取消点赞');
      loadLikes(); // Reload the list
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <List
      loading={loading}
      itemLayout="vertical"
      dataSource={likes}
      renderItem={item => (
        <List.Item
          actions={[
            <Button 
              type="link" 
              icon={<LikeOutlined />}
              onClick={() => handleUnlike(item.id)}
            >
              取消点赞
            </Button>
          ]}
          extra={
            <span>总点赞数：{item.totalLikes}</span>
          }
        >
          <List.Item.Meta
            title={
              <a onClick={() => navigate(`/post/${item.postId}`)}>
                {item.postTitle}
              </a>
            }
            description={`作者：${item.author} | 点赞时间：${item.createTime}`}
          />
        </List.Item>
      )}
    />
  );
} 