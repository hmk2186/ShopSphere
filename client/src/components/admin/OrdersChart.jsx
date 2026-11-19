import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const OrdersChart = ({ data = [] }) => {
  return (
    <div
      className="card p-4 border shadow-sm"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-lg)' }}
    >
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h6 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
            Order Velocity
          </h6>
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>
            Completed customer transactions
          </span>
        </div>
      </div>

      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
              }}
              formatter={(val) => [val, 'Orders']}
            />
            <Bar dataKey="orders" fill="#FF8A35" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OrdersChart;
