import { Form, Input, Button, Card, Select, message } from 'antd';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const { Option } = Select;

export default function PostEdit() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      loadPost();
    }
  }, [id]);

  const loadPost = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const post = {
        title: '测试文章标题',
        content: '<p>这是文章内容</p>',
        summary: '这是文章摘要',
        status: 'draft'
      };
      setInitialValues(post);
      form.setFieldsValue(post);
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success(isEdit ? '更新成功' : '发布成功');
      navigate('/profile');
    } catch (error) {
      message.error(isEdit ? '更新失败' : '发布失败');
    } finally {
      setLoading(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      <Card title={isEdit ? '编辑文章' : '发布新文章'}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={initialValues || {
            status: 'draft'
          }}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入文章标题' }]}
          >
            <Input placeholder="请输入文章标题" />
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入文章内容' }]}
          >
            <ReactQuill 
              theme="snow"
              modules={modules}
              style={{ height: '300px', marginBottom: '50px' }}
            />
          </Form.Item>

          <Form.Item
            name="summary"
            label="摘要"
            rules={[{ required: true, message: '请输入文章摘要' }]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="请输入文章摘要，将显示在文章列表中"
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
          >
            <Select>
              <Option value="draft">草稿</Option>
              <Option value="published">发布</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? '更新' : '发布'}
            </Button>
            <Button 
              style={{ marginLeft: 8 }} 
              onClick={() => navigate(-1)}
            >
              取消
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
} 