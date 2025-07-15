import { useEffect, useState } from "react";
import { Card, Input, Button, message } from "antd";
import { getProfile, updateProfile } from "../../api/user";

export default function Settings() {
  const [profile, setProfile] = useState({ nickname: "", avatar: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProfile().then(setProfile);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    await updateProfile(profile);
    setLoading(false);
    message.success("保存成功");
  };

  return (
    <Card title="账号信息">
      <Input
        placeholder="昵称"
        value={profile.nickname}
        onChange={e => setProfile({ ...profile, nickname: e.target.value })}
        style={{ marginBottom: 8 }}
      />
      <Input
        placeholder="头像链接"
        value={profile.avatar}
        onChange={e => setProfile({ ...profile, avatar: e.target.value })}
        style={{ marginBottom: 8 }}
      />
      <Button type="primary" onClick={handleSave} loading={loading}>保存</Button>
    </Card>
  );
}