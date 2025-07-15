import { Layout, Menu } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import UserLayout from "../components/Layout/UserLayout";
//import AuthRoute from "../components/AuthRoute";

const { Header, Content, Sider } = Layout;

export default function UserLayout() {
  const navigate = useNavigate();
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header>
        <div style={{ color: "#fff", fontWeight: "bold" }}>User System</div>
      </Header>
      <Layout>
        <Sider>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["home"]}
            onClick={({ key }) => navigate(key)}
            items={[
              { key: "home", label: "Home" },
              { key: "profile/posts", label: "My Posts" },
              { key: "profile/comments", label: "My Comments" },
              { key: "profile/likes", label: "My Likes" },
              { key: "profile/settings", label: "Account Info" },
            ]}
          />
        </Sider>
        <Layout>
          <Content style={{ margin: "16px" }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}