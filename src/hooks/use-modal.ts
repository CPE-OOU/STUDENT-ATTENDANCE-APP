import { ClientUser } from '@/lib/auth';
import { create } from 'zustand';

type ModalType = 'take-capture' | 'verify-capture';

type ModalData = {
  user?: ClientUser;
};

interface ModalStore {
  type: ModalType | null;
  data: ModalData | null;
  opened: boolean;
  onOpen(type: NonNullable<this['type']>, data?: ModalData): void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set, get) => ({
  opened: false,
  type: null,
  data: null,
  onOpen: (type, data) => {
    set({ opened: true, type, data: { ...get().data, ...data } });
  },

  onClose: () => set({ type: null, opened: false, data: null }),
}));
