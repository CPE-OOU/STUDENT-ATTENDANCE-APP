import { parsedEnv } from '@/config/env/validate';
import { SuccessServerResponsePayload } from '@/lib/response';
import axios from 'axios';

export const getLectureAttendanceCourses = async () => {
  const {
    data: { data },
  } = await axios.get<SuccessServerResponsePayload<{}>>(
    `${parsedEnv.NEXT_PUBLIC_URL}/api/courses`
  );

  return data;
};
