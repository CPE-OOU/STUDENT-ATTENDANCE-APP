import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Archive, Library, User2 } from 'lucide-react';
import { SideAction } from '../../../account/__components/side-action';
import { ClientUser } from '@/lib/auth';
import { db } from '@/config/db/client';
import { sql } from 'drizzle-orm';
import { attendances, courses, lecturerAttendees } from '@/config/db/schema';
import postgres from 'postgres';
// import { Overview } from './overview';
import { RecentAttendance } from '../recent-attendance';

interface StudentDashboardProps {
  totalAttendance: number;
  totalPresent: number;
  totalAbsent: number;
  totalCourse: number;
  user: ClientUser;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = async ({
  totalAbsent,
  totalAttendance,
  totalCourse,
  totalPresent,
  user,
}) => {
  const tags = [
    {
      title: 'Total Course',
      value: totalCourse,
      icon: <User2 className="w-4 h-4 text-muted-foreground" />,
    },
    {
      title: 'Total Attendance',
      value: totalAttendance,
      icon: <User2 className="w-4 h-4 text-muted-foreground" />,
    },
    {
      title: 'Present Attendance',
      value: totalPresent,
      icon: <Library className="w-4 h-4 text-muted-foreground" />,
    },
    {
      title: 'Absent Attendance',
      value: totalAbsent,
      icon: <Archive className="w-4 h-4 text-muted-foreground" />,
    },
  ];

  // const graphData = (await db.execute(sql`
  //        SELECT ${courses.id},${courses.courseCode} as "courseCode", ${
  //   courses.name
  // }, count(*) as "attendanceNo"  FROM ${courses}
  //         LEFT JOIN ${attendances} ON ${attendances.courseId} = ${courses.id}
  //         WHERE ${courses.id} in (
  //         SELECT ${lecturerAttendees.courseId} FROM ${lecturerAttendees}
  //         WHERE ${lecturerAttendees.lecturerId} = ${user.lecturer!.id}
  //         )
  //         GROUP BY ${courses.id}

  // `)) as postgres.RowList<
  //   Array<{
  //     id: string;
  //     courseCode: string;
  //     name: string;
  //     attendanceNo: number;
  //   }>
  // >;

  return (
    <div>
      <div className="flex">
        <div className="flex-grow flex flex-col pt-[65px] px-8 h-full">
          <div className="flex mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-[#4f4d53]">
              Dashboard
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tags.map((tag) => (
              <Card key={tag.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {tag.title}
                  </CardTitle>

                  {tag.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tag.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 ">
            {/* <Overview data={Array.from(graphData)} /> */}
          </div>
        </div>
        <div className="flex-shrink-0 w-[480px] ">
          {/* <SideAction
            user={user}
            sideAreaComponent={
              <div>
                <RecentAttendance />
              </div>
            }
          /> */}
        </div>
      </div>
    </div>
  );
};
