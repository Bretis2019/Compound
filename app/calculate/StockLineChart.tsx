"use client"

import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    XAxis,
    YAxis
} from "recharts"

export function StockLineChart(props: any) {

    const { data } = props;

    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <Legend />
                <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                />
                <Line
                    dataKey="deposits"
                    stroke="#FF0000"
dot={false}
                />
                <Line
                    dataKey="compound"
                    stroke="#F5F5F5"
dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}