import React from "react";
import { Table, Button, Space, Tag, Typography, Card, message } from "antd";
import { PlusOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { useAuthStore } from "../store/useAuthStore";

const { Title, Text } = Typography;

const Orders: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await api.get("/orders");
      return res.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/orders/${id}/approve`, {
        warehouseId: 1,
        comment: "Approved via UI",
      });
    },
    onSuccess: () => {
      message.success("Order fulfilled successfully");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || "Failed to approve order");
    },
  });

  const columns = [
    {
      title: "Order Code",
      dataIndex: "orderCode",
      key: "orderCode",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Created By",
      dataIndex: ["createdBy", "fullName"],
      key: "createdBy",
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (val: number) =>
        `$${parseFloat(val.toString()).toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color = status === "APPROVED" ? "success" : "warning";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => {
        const canApprove =
          (user?.role === "ADMIN" || user?.role === "WAREHOUSE_MANAGER") &&
          record.status === "PENDING_APPROVAL";

        return (
          <Space size="middle">
            <a>View</a>
            {canApprove && (
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                style={{ color: "#52c41a", padding: 0 }}
                loading={approveMutation.isPending}
                onClick={() => approveMutation.mutate(record.id)}
              >
                Approve
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Orders Fulfillment
        </Title>
        <Button type="primary" icon={<PlusOutlined />}>
          Draft Order
        </Button>
      </div>

      <Card
        bordered={false}
        style={{ background: "#141414", borderRadius: 12 }}
      >
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default Orders;
