import { ClientUser } from '@/lib/auth';
import { FirstNameEditForm } from './firstName-edit-form';
import { LastNameFormEdit } from './lastName-edit-form';

interface LecturerUpdateFormProps {
  user: ClientUser;
}

export const LecturerUpdateForm: React.FC<LecturerUpdateFormProps> = ({
  user,
}) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      <FirstNameEditForm firstName={user.firstName} />
      <LastNameFormEdit lastName={user.lastName} />
    </div>
  );
};
