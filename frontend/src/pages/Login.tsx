import React, { useState } from "react";
import { Form, Input, Button, message, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { api } from "../services/api";
import { useAuthStore } from "../store/useAuthStore";
import "../index.css";

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email: values.email,
        password: values.password,
      });

      const { access_token } = response.data;

      // Decode user info from JWT
      const decoded: any = jwtDecode(access_token);

      // Zustand Persist
      setAuth(
        {
          id: decoded.sub,
          email: decoded.email,
          fullName: decoded.fullName || decoded.email.split("@")[0],
          role: decoded.role,
        },
        access_token,
      );

      message.success("Login successful!");
      navigate("/dashboard");
    } catch (error: any) {
      if (error.response?.status === 401) {
        message.error("Invalid email or password");
      } else {
        message.error("System error occurred. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)",
      }}
    >
      <div
        className="glass-panel"
        style={{
          padding: "40px 32px",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
          Fulfillment System
        </Title>
        <Text type="secondary" style={{ display: "block", marginBottom: 32 }}>
          Enterprise Management Portal
        </Text>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your Email!" },
              { type: "email", message: "Invalid email" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email address" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your Password!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{ fontWeight: 600 }}
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
