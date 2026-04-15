import React from 'react';
import { Table, Button, Input, Space, Tag, Typography, Card } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

const { Title } = Typography;

const Products: React.FC = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/products');
      return res.data;
    },
  });

  const columns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${parseFloat(price.toString()).toLocaleString()}`,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat: any) => <Tag color="blue">{cat?.name || 'N/A'}</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Space size="middle">
          <a>Edit</a>
          <a>Adjust Stock</a>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Products & Inventory Catalog</Title>
        <Space>
          <Input placeholder="Search SKU or Name" prefix={<SearchOutlined />} style={{ width: 250 }} />
          <Button type="primary" icon={<PlusOutlined />}>
            New Product
          </Button>
        </Space>
      </div>

      <Card bordered={false} style={{ background: '#141414', borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

const { Text } = Typography;
export default Products;
