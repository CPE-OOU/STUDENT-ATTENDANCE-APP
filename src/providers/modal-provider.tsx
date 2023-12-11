'use client';

import { TakeCaptureModal } from '@/components/modals/take-capture';
import { useMount } from '@/hooks/use-mouted';

export const ModalProvider = () => {
  const mounted = useMount();

  if (!mounted) return null;

  return (
    <>
      <TakeCaptureModal />
    </>
  );
};

//https://www.behance.net/gallery/155935905/Face-Recognition-Web-Application?tracking_source=search_projects|face+recognition+design&l=43
