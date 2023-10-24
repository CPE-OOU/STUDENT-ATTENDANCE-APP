'use client';

import { clientCreateNewUserValidator } from '@/app/(auth)/(routes)/(gain-access)/sign-up/__components/form';
import { studentProfileFormSchema } from '@/app/(setup)/(routes)/set-up/__validator/set-up-validator';
import { ClientUser } from '@/lib/auth';
import { TypeOf, object, string } from 'zod';
import { FirstNameEditForm } from './firstName-edit-form';
import { LastNameFormEdit } from './lastName-edit-form';
import { DepartmentFormEdit } from './department-edit-form';
import { StudentLevelFormEdit } from './level-edit-form';
import { UniversityFormEdit } from './university-edit-form';

interface StudentUpdateFormProps {
  user: ClientUser;
}

export const StudentUpdateForm: React.FC<StudentUpdateFormProps> = ({
  user,
}) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      <FirstNameEditForm firstName={user.firstName} />
      <LastNameFormEdit lastName={user.lastName} />
      <DepartmentFormEdit department={user.student?.department} />
      <StudentLevelFormEdit
        level={
          user.student?.level as NonNullable<
            NonNullable<typeof user.student>['level']
          >
        }
      />
      <UniversityFormEdit university={user.student?.university!} />
    </div>
  );
};
