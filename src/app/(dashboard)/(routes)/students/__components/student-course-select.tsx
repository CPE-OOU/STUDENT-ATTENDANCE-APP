'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Course } from '@/config/db/schema';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface StudentCourseSelectProps {
  courses: Array<Course>;
}

export const StudentCourseSelect: React.FC<StudentCourseSelectProps> = ({
  courses,
}) => {
  const [courseId, setCourseId] = useState<string | null>(null);
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (courseId) {
      const nextParams = new URLSearchParams(params);
      nextParams.set('courseId', courseId);
      router.push(`${pathname}?${nextParams}`);
    }
  }, [courseId]);

  return (
    <div>
      <Select onValueChange={setCourseId}>
        <SelectTrigger className="w-[180px] bg-[#F7F7F7]">
          <SelectValue placeholder="Select a course" />
        </SelectTrigger>
        {!!courses.length && (
          <SelectContent className="bg-white">
            <SelectGroup>
              {courses.map(({ id, courseCode }) => (
                <SelectItem value={id} key={id}>
                  {courseCode}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        )}
      </Select>
    </div>
  );
};
