'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface ActiveAttendanceItemProps {
  title: string;
  icon: React.ReactNode;
  value: number | string;
  path: string;
}

export const ActiveAttendanceItem: React.FC<ActiveAttendanceItemProps> = ({
  title,
  value,
  path,
  icon,
}) => {
  const router = useRouter();
  return (
    <Card key={title} className="p-6 space-y-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-2 p-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>

        {icon}
      </CardHeader>
      <CardContent className="p-0 flex items-center justify-between">
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <Button
          variant="primary"
          className="bg-[#FDCB9E] px-6 py-2"
          onClick={() => {
            router.push(path);
          }}
        >
          View
        </Button>
      </CardContent>
    </Card>
  );
};
