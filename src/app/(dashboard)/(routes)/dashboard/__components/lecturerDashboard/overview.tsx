'use client';

import {
  Bar,
  BarChart,
  Label,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

interface OverviewProps {
  data: Array<{
    id: string;
    courseCode: string;
    name: string;
    attendanceNo: number;
  }>;
}
export function Overview({ data }: OverviewProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          bottom: 5,
        }}
      >
        <XAxis
          dataKey="courseCode"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={true}
        />
        <YAxis
          dataKey={'attendanceNo'}
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={true}
        >
          <Label
            dx={-20}
            offset={40}
            className="text-slate-900 text-xs"
            style={{
              textAnchor: 'middle',
            }}
            angle={270}
            value={'No of Attendance'}
          />
        </YAxis>

        <Bar
          dataKey="attendanceNo"
          maxBarSize={45}
          fill="#CCEABB"
          barSize={84}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
