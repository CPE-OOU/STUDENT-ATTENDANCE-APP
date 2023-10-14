'use client';
import { SetupComponentFnProps, useExternalSetupState } from './setup-client';
import { SetupChooseAccountTypeFormData } from '../__validator/set-up-validator';
import { useRouter } from 'next/navigation';
import { LecturerUpdateAccountDetail } from './update-lecturer-detail';
import { StudentUpdateAccountDetail } from './update-student-detail';
import { useEffect, useRef } from 'react';

interface UpdateAccountDetailsProps extends SetupComponentFnProps {}

export const UpdateAccountDetail: React.FC<UpdateAccountDetailsProps> = ({
  stepOption,
}) => {
  const { getStepData, setStepState, data: _ } = useExternalSetupState();
  const router = useRouter();
  const typeData = getStepData(1) as SetupChooseAccountTypeFormData | undefined;
  if (!typeData) {
    router.refresh();
    return null;
  }

  const { type } = typeData;
  const prevType = useRef<typeof type | null>(null);

  useEffect(() => {
    if (prevType.current !== null) setStepState(2, {});
    prevType.current = type;
  }, [type]);

  return (
    <div>
      {type === 'teacher' ? (
        <LecturerUpdateAccountDetail stepOption={stepOption} />
      ) : (
        <StudentUpdateAccountDetail stepOption={stepOption} />
      )}
    </div>
  );
};
