import React from "react";
import { Typography, Card } from "antd";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const { Title, Text } = Typography;

const data = [
  { name: "Mon", revenue: 4000, volume: 2400 },
  { name: "Tue", revenue: 3000, volume: 1398 },
  { name: "Wed", revenue: 2000, volume: 9800 },
  { name: "Thu", revenue: 2780, volume: 3908 },
  { name: "Fri", revenue: 1890, volume: 4800 },
  { name: "Sat", revenue: 2390, volume: 3800 },
  { name: "Sun", revenue: 3490, volume: 4300 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: "12px 16px",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Text strong style={{ display: "block", marginBottom: 8 }}>
          {label}
        </Text>
        <Text style={{ color: "#177ddc", display: "block" }}>
          Revenue: ${payload[0].value.toLocaleString()}
        </Text>
        <Text style={{ color: "#00b96b", display: "block" }}>
          Volume: {payload[1].value.toLocaleString()} units
        </Text>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC = () => {
  return (
    <div>
      <Title level={4}>Performance Overview</Title>
      <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
        A high-level look at fulfillment momentum for the last 7 days.
      </Text>

      <Card
        bordered={false}
        style={{
          background: "#141414",
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            padding: "16px 0",
            borderBottom: "1px solid #303030",
            marginBottom: 24,
          }}
        >
          <Text strong style={{ fontSize: 24 }}>
            $19,550
          </Text>
          <Text type="secondary" style={{ marginLeft: 12 }}>
            Total Revenue
          </Text>
        </div>
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#177ddc" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#177ddc" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00b96b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00b96b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#303030"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#595959"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#595959"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#177ddc"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#00b96b"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorVolume)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
