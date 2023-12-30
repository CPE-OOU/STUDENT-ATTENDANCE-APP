import { createSafeActionClient } from 'next-safe-action';

export const action = createSafeActionClient({
  handleReturnedServerError: (e) => ({ serverError: e.message }),
});
