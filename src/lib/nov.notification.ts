import { parsedEnv } from '@/config/env/validate';
import { Novu } from '@novu/node';

export const novuNotification = new Novu(parsedEnv.NOVU_API_KEY);
