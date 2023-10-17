import { NextResponse } from 'next/server';
import { ZodError, fromZodError } from 'zod-validation-error';
import { StatusCodes } from 'http-status-codes';

interface APIResourceAction {
  url: string;
  method: 'get' | 'delete' | (string & {});
}

type ServerResponsePayload = {
  success: boolean;
  title: string;
  message?: string;
  data?: unknown;
  error?: unknown;
  actions?: Array<APIResourceAction>;
};

interface SuccessServerResponsePayload<Resource = unknown>
  extends ServerResponsePayload {
  success: true;
  data?: Resource;
}

interface FailedServerResponsePayload extends ServerResponsePayload {
  success: false;
}

const createSuccessResponse = <const Payload = unknown>(
  response: Omit<SuccessServerResponsePayload<Payload>, 'success' | 'error'>,
  status: number
) => NextResponse.json({ success: true, ...response }, { status });

const createFailResponse = <const Payload = unknown>(
  response: Omit<SuccessServerResponsePayload<Payload>, 'success' | 'data'>,
  status: number
) => NextResponse.json({ success: false, ...response }, { status });

const getInvalidQueryParamsResponse = (error: ZodError) =>
  createFailResponse(
    {
      title: 'INVALID QUERY PARAMATER',
      message: fromZodError(error).toString(),
    },
    StatusCodes.BAD_REQUEST
  );

const getRecordAlreadyExistResponse = ({
  title,
  message,
}: {
  title: string;
  message: string;
}) => createFailResponse({ title, message }, StatusCodes.CONFLICT);
export type { SuccessServerResponsePayload, FailedServerResponsePayload };

export {
  createSuccessResponse,
  createFailResponse,
  getInvalidQueryParamsResponse,
  getRecordAlreadyExistResponse,
};
