'use client'
// components/TrendChart.js — Line chart of monthly contribution totals
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Legend
} from 'recharts'

function fmt(v) {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `${(v / 1e6).toFixed(0)}M`
  return v.toLocaleString()
}

export default function TrendChart({ data }) {
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} />
          <Tooltip formatter={v => `KES ${fmt(v)}`} />
          <Legend />
          <ReferenceLine y={4409007000} stroke="#E63946" strokeDasharray="6 3"
            label={{ value: 'Presidential Limit', fill: '#E63946', fontSize: 10 }} />
          <Line type="monotone" dataKey="total" stroke="#1B2A4A" strokeWidth={2.5}
            dot={{ r: 3 }} name="Total Contributions (KES)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
