'use client';
import type { AccountSetting } from '@/config/db/schema';
import type { ClientUser } from '@/lib/auth';
import React, { useContext, useState } from 'react';
import Steps from 'rc-steps';
import 'rc-steps/assets/index.css';
import './setup-client.css';
import { StepProps } from 'rc-steps/lib/Step';
import { create } from 'zustand';
import { PickAccountType } from './set-account-type';
import { OptionalUploadProfile } from './optional-upload-profile';
import {
  OptionalProfileImageFormData,
  SetupChooseAccountTypeFormData,
  StudentSetupProfileFormData,
} from '../__validator/set-up-validator';
import { UpdateAccountDetail } from './update-account-details';

interface SetupClientProps {
  setting: AccountSetting;
  user: ClientUser;
}

export type SetupComponentFnProps = {
  stepOption: ProfileUpdateSetup;
};

type ProfileUpdateSetup = {
  label: string;
  tag: string;
  step: number;
  permitSkip?: boolean;
  status?: NonNullable<StepProps['status']>;
  component?: (props: SetupComponentFnProps) => React.ReactNode;
};

const updateSteps = [
  {
    label: 'Account Type',
    tag: 'account-type',
    step: 1,
    component: PickAccountType,
  },
  {
    label: 'Personalisation',
    tag: 'personalize',
    step: 2,
    component: UpdateAccountDetail,
  },
  {
    label: 'Finalizing',
    step: 3,
    tag: 'finalize',
    component: OptionalUploadProfile,
  },
] as Array<ProfileUpdateSetup>;

const SetupContext = React.createContext(
  {} as {
    user: ClientUser;
    setting: AccountSetting;
    currentStep: number;
    setStepCompleted(
      step: number,
      option: {
        completed: boolean;
        submitTriggerred?: boolean;
      }
    ): void;
  } & Pick<
    SetupStateStore,
    'getStepData' | 'setStepError' | 'setStepState' | 'data'
  >
);

interface StepFormState {
  data?: unknown;
  errored?: boolean;
  completed?: boolean;
  continued?: boolean;
}

type SetupStateStore = {
  setStepState: (step: number, state: unknown, isMounting?: boolean) => void;
  setStepError: (step: number, errored: boolean) => void;
  setStepCompleted: (step: number, completed: boolean) => void;
  getStepErrorStatus: (step: number) => boolean;
  getStepData: (step: number) => unknown;
  data?: { [step: string]: StepFormState };
};

const useInternalSetupState = create<SetupStateStore>((set, get) => ({
  setStepError(step, status) {
    const data = { ...get().data };
    const stepState = { ...data[step] };
    data[step] = stepState;
    stepState.errored = status;
    set({ data });
  },
  setStepState(step, currentStepState) {
    const data = { ...get().data };
    const stepState = { ...data[step] };
    data[step] = stepState;
    stepState.data = currentStepState;
    set({ data });
  },
  setStepCompleted(step, completed) {
    const data = { ...get().data };
    const stepState = { ...data[step] };
    data[step] = stepState;
    stepState.completed = completed;
    set({ data });
  },
  getStepData: (step) => {
    const data = get().data ?? {};
    if (!(step in data)) {
      throw new Error(
        'The current step state not properly intialized before access'
      );
    }
    const stepState = { ...data[step] };
    return stepState.data;
  },
  getStepErrorStatus(step) {
    const data = get().data ?? {};
    const stepState = { ...data[step] };
    return !!stepState.errored;
  },
  data: Object.fromEntries(
    updateSteps.map(({ step }) => [step, { errored: false }])
  ),
}));

export const useExternalSetupState = () => useContext(SetupContext);

const SetupClient: React.FC<SetupClientProps> = ({ setting, user }) => {
  const [current, setCurrent] = useState(0);

  const {
    setStepError,
    setStepState,
    getStepData,
    getStepErrorStatus,
    data,
    setStepCompleted,
  } = useInternalSetupState();

  let CurrentPageSetUp = updateSteps[current]?.component ?? null;
  let currentSetOption = updateSteps[current]!;

  return (
    <div>
      <Steps
        type="navigation"
        direction="horizontal"
        current={current}
        onChange={setCurrent}
        items={updateSteps.map(({ label, step }) => {
          let status!: NonNullable<StepProps['status']>;
          let disabled = false;
          const activeStep = current === step - 1;

          switch (step) {
            case 1: {
              const data = getStepData(step) as
                | undefined
                | SetupChooseAccountTypeFormData;
              const errored = getStepErrorStatus(step);

              const completed = data && !errored;
              status = activeStep
                ? 'process'
                : completed
                ? 'finish'
                : 'process';

              break;
            }

            case 2: {
              const data = getStepData(step) as
                | undefined
                | StudentSetupProfileFormData;
              const errored = getStepErrorStatus(step);

              const prevStepData = getStepData(step - 1);
              const prevStepErrored = getStepErrorStatus(step - 1);
              const waiting = !(prevStepData && prevStepErrored === false);

              const completed = !!(data && !errored);

              status = activeStep
                ? 'process'
                : completed
                ? 'finish'
                : waiting
                ? 'wait'
                : errored
                ? 'error'
                : 'finish';

              disabled = status === 'wait';
              break;
            }

            case 3: {
              const data = getStepData(step) as
                | OptionalProfileImageFormData
                | undefined;
              const errored = getStepErrorStatus(step);

              const prevStepData = getStepData(step - 1);
              const prevStepErrored = getStepErrorStatus(step - 1);
              const waiting = !(prevStepData && prevStepErrored === false);

              const completed = !!(data && !errored);

              status = activeStep
                ? 'process'
                : completed
                ? 'finish'
                : waiting
                ? 'wait'
                : errored
                ? 'error'
                : 'wait';

              disabled =
                waiting && !(prevStepData && prevStepErrored === false);
              break;
            }
          }

          if (status === 'error' && current === step) {
            status = 'process';
          }

          return {
            title: label,
            status,
            disabled,
          };
        })}
      />
      <div className="mt-[72px] flex justify-center w-full">
        <SetupContext.Provider
          value={{
            user,
            data: data!,
            setting,
            getStepData,
            setStepError,
            currentStep: current,
            setStepCompleted: (
              step,
              { completed, submitTriggerred: submitted = false }
            ) => {
              setStepCompleted(step, completed);
              if (submitted && completed && step < updateSteps.length) {
                setCurrent(step);
              }
            },
            setStepState: (step, state, unmounting) => {
              setStepState(step, state);
              if (unmounting) return;
            },
          }}
        >
          {CurrentPageSetUp && (
            <CurrentPageSetUp stepOption={currentSetOption} />
          )}
        </SetupContext.Provider>
      </div>
    </div>
  );
};

export default SetupClient;
