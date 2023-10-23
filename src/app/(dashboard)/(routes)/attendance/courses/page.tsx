import { getUrlQuery } from '@/lib/utils';
import { searchParamsSchema } from '@/lib/validations/params';
import { object, string } from 'zod';

const currentPageSearchParams = searchParamsSchema.and(
  object({
    courseId: string().uuid(),
  })
);

const CourseAttendancePage = ({
  searchParams,
}: {
  searchParams: { [query: string]: unknown };
}) => {
  try {
    const { offset, courseId, per_page } =
      currentPageSearchParams.parse(searchParams);
  } catch (e) {}
  return <div></div>;
};

export default CourseAttendancePage;
