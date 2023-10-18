import { getUrlQuery } from '@/lib/utils';
import { searchParamsSchema } from '@/lib/validations/params';
import { object, string } from 'zod';

const currentPageSearchParams = searchParamsSchema.and(
  object({
    courseId: string().uuid(),
  })
);

const CourseAttendancePage = (req: Request) => {
  try {
    const { offset, courseId, per_page } = currentPageSearchParams.parse(
      getUrlQuery(req.url)
    );
  } catch (e) {}
  return <div></div>;
};

export default CourseAttendancePage;
