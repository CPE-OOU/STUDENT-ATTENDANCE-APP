import { create } from 'zustand';

interface UseGlobalState {
  initiateRegTeacherClassSetup?: boolean;
  authRedirectUrl?: string | null;
  accountVerifyTokenLength?: number;
  setAccountVerifyTokenLength: (length: number) => void;

  tokenResendTrialTime?: { value: number; type: 's' | 'm' };
  setResendTrialTime: (trial: { value: number; type: 's' | 'm' }) => void;
  setRedirectUrl: (url?: null | string) => void;
  setInitialRegTeacherClassSetup: (status: boolean) => void;
}

const useGlobalState = create<UseGlobalState>((set) => ({
  initiateRegTeacherClassSetup: false,
  setInitialRegTeacherClassSetup: (status) => {
    set({ initiateRegTeacherClassSetup: status });
  },
  setRedirectUrl(url) {
    set({ authRedirectUrl: url ?? null });
  },
  setAccountVerifyTokenLength(length) {
    set({ accountVerifyTokenLength: length });
  },

  setResendTrialTime(trial) {
    set({ tokenResendTrialTime: trial });
  },
}));

export { useGlobalState };
