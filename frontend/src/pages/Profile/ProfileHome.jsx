import { Outlet } from "react-router-dom";
import { Card } from "antd";

export default function ProfileHome() {
  return (
    <Card title="个人中心">
      <Outlet />
    </Card>
  );
}