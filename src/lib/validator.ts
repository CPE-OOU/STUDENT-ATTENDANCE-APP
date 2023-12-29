import { ZodError } from 'zod';
import { ZodIssue } from 'zod-validation-error';

export function classifyErrorType(error: ZodError) {
  const classifiedError: { [K in 'query' | 'body']?: Array<ZodIssue> } = {};

  error.errors.forEach((issue) => {
    const { path } = issue;
    for (let key in path) {
      if (key === 'query') {
        const queryErrors = (classifiedError['query'] =
          classifiedError['query'] || []);

        queryErrors.push(issue);
      }

      if (key === 'body') {
        const bodyErros = (classifiedError['body'] =
          classifiedError['body'] || []);

        bodyErros.push(issue);
      }
    }
  });

  return Object.fromEntries(
    Array.from(Object.entries(classifiedError), ([key, value]) => [
      key,
      new ZodError(value),
    ])
  ) as { [K in keyof typeof classifiedError]: ZodError };
}
