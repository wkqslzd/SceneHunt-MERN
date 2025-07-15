import { useEffect, useState } from "react";
import { List, Button, message } from "antd";
import { getMyPosts, deletePost } from "../../api/post";
import { useNavigate } from "react-router-dom";

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getMyPosts().then(setPosts);
  }, []);

  const handleDelete = async (id) => {
    await deletePost(id);
    message.success("删除成功");
    setPosts(posts.filter(p => p.id !== id));
  };

  return (
    <List
      header="我的投稿"
      dataSource={posts}
      renderItem={item => (
        <List.Item
          actions={[
            <Button onClick={() => navigate(`/post/edit/${item.id}`)}>编辑</Button>,
            <Button danger onClick={() => handleDelete(item.id)}>删除</Button>
          ]}
        >
          {item.title}
        </List.Item>
      )}
    />
  );
}