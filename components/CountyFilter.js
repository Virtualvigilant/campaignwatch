'use client'

export default function CountyFilter({ counties, typeFilter, countyFilter }) {
    return (
        <select
            defaultValue={countyFilter}
            onChange={e => window.location.href = `?type=${typeFilter}&county=${e.target.value}`}
            className="text-xs border border-gray-300 rounded-lg px-2 py-1 text-gray-700">
            {counties.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
    )
}
