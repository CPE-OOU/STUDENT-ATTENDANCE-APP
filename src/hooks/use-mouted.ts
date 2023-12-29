'use client';

import { useEffect, useState } from 'react';

export const useMount = () => {
  const [componentMounted, setComponentMounted] = useState(false);
  useEffect(() => {
    setComponentMounted(true);
  }, []);
  return componentMounted;
};
