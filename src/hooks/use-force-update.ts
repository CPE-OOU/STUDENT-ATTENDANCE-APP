import { useCallback, useState } from 'react';

export const useForceUpdate = () => {
  const [_, setInnerUpdate] = useState(0);
  return useCallback(() => {
    setInnerUpdate(Math.random());
  }, []);
};
