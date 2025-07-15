import { useEffect, useState } from "react";
import { List, Button } from "antd";
import { getMyLikes } from "../../api/user";
import { useNavigate } from "react-router-dom";

export default function MyLikes() {
  const [likes, setLikes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getMyLikes().then(setLikes);
  }, []);

  return (
    <List
      header="My Likes"
      dataSource={likes}
      renderItem={item => (
        <List.Item
          actions={[
            <Button onClick={() => navigate(`/post/${item.id}`)}>View</Button>
          ]}
        >
          {item.title}
        </List.Item>
      )}
    />
  );
}