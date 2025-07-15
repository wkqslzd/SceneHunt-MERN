import { useEffect, useState } from "react";
import { List, Button, message } from "antd";
import { getMyComments, deleteComment } from "../../api/comment";

export default function MyComments() {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    getMyComments().then(setComments);
  }, []);

  const handleDelete = async (id) => {
    await deleteComment(id);
    message.success("删除成功");
    setComments(comments.filter(c => c.id !== id));
  };

  return (
    <List
      header="My Comments"
      dataSource={comments}
      renderItem={item => (
        <List.Item
          actions={[
            <Button danger onClick={() => handleDelete(item.id)}>Delete</Button>
          ]}
        >
          {item.content}
        </List.Item>
      )}
    />
  );
}