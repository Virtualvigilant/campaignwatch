'use client'
// components/SpendingChart.js — Bar chart of expenditure by category
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts'

const COLORS = ['#1B2A4A', '#F5A623', '#2DC653', '#E63946', '#2D4A7A', '#FDC96A', '#5DE07D', '#FF6B76']

function fmt(v) {
    if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`
    if (v >= 1e6) return `${(v / 1e6).toFixed(0)}M`
    return v.toLocaleString()
}

export default function SpendingChart({ data }) {
    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={v => `KES ${fmt(v)}`} />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]} name="Spending (KES)">
                        {(data || []).map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
