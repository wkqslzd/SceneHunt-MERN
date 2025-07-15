import { Card, Button, Avatar, Space, Divider, Input, List, message } from 'antd';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  LikeOutlined, 
  LikeFilled,
  UserOutlined,
  EditOutlined,
  DeleteOutlined 
} from '@ant-design/icons';

const { TextArea } = Input;

export default function PostDetail() {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    loadPost();
    loadComments();
  }, [id]);

  const loadPost = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPost({
        id,
        title: '测试文章标题',
        content: '<p>这是文章的详细内容</p>',
        author: '作者A',
        createTime: '2024-03-20',
        likes: 10,
        isLiked: false,
        isAuthor: username === '作者A'
      });
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setComments([
        {
          id: 1,
          content: '这是一条评论',
          author: '用户B',
          createTime: '2024-03-20',
          likes: 5,
          isLiked: false
        }
      ]);
    } catch (error) {
      message.error('加载评论失败');
    }
  };

  const handleLike = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPost(prev => ({
        ...prev,
        likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
        isLiked: !prev.isLiked
      }));
      message.success(post?.isLiked ? '已取消点赞' : '点赞成功');
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleComment = async () => {
    if (!commentContent.trim()) {
      return message.warning('请输入评论内容');
    }
    setCommenting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('评论成功');
      setCommentContent('');
      loadComments();
    } catch (error) {
      message.error('评论失败');
    } finally {
      setCommenting(false);
    }
  };

  const handleDelete = () => {
    if (!post?.isAuthor && userRole !== 'Super Administrator') {
      return message.error('没有权限删除');
    }
    
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这篇文章吗？此操作不可恢复。',
      onOk: async () => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          message.success('删除成功');
          navigate('/');
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  if (!post) {
    return null;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      <Card
        title={post.title}
        extra={
          <Space>
            <Button
              type={post.isLiked ? 'primary' : 'default'}
              icon={post.isLiked ? <LikeFilled /> : <LikeOutlined />}
              onClick={handleLike}
            >
              {post.likes} 点赞
            </Button>
            {post.isAuthor && (
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => navigate(`/post/edit/${id}`)}
              >
                编辑
              </Button>
            )}
            {(post.isAuthor || userRole === 'Super Administrator') && (
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                onClick={handleDelete}
              >
                删除
              </Button>
            )}
          </Space>
        }
      >
        <div className="post-meta" style={{ marginBottom: 16 }}>
          <Space>
            <Avatar icon={<UserOutlined />} />
            <span>{post.author}</span>
            <span>{post.createTime}</span>
          </Space>
        </div>
        <div 
          className="post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        <Divider />
        
        <div className="comments-section">
          <h3>评论</h3>
          <div style={{ marginBottom: 16 }}>
            <TextArea
              rows={4}
              value={commentContent}
              onChange={e => setCommentContent(e.target.value)}
              placeholder="写下你的评论..."
            />
            <Button
              type="primary"
              loading={commenting}
              onClick={handleComment}
              style={{ marginTop: 8 }}
            >
              发表评论
            </Button>
          </div>
          
          <List
            itemLayout="horizontal"
            dataSource={comments}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    icon={item.isLiked ? <LikeFilled /> : <LikeOutlined />}
                    onClick={() => handleLike(item.id)}
                  >
                    {item.likes} 点赞
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={item.author}
                  description={item.createTime}
                />
                {item.content}
              </List.Item>
            )}
          />
        </div>
      </Card>
    </div>
  );
} 