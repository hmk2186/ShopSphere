import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const CategoryPieChart = ({ data = [] }) => {
  const COLORS = ['#315FEA', '#FF8A35', '#16A36A', '#9333EA', '#0EA5E9', '#EAB308'];

  return (
    <div
      className="card p-4 border shadow-sm"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-lg)' }}
    >
      <div className="mb-2">
        <h6 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
          Category Revenue Share
        </h6>
        <span className="text-muted" style={{ fontSize: '0.8rem' }}>
          Sales distribution by category
        </span>
      </div>

      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
              }}
              formatter={(val) => [`$${val.toLocaleString()}`, 'Sales']}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryPieChart;
