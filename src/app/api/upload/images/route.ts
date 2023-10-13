import { createFailResponse, createSuccessResponse } from '@/lib/response';
import { supabase } from '@/lib/supabase';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuid4 } from 'uuid';
import { array, object, string, union } from 'zod';

const queryValidator = object({
  removeImages: union([string().url(), array(string().url())])
    .transform((value) => (<Array<string>>[]).concat(value))
    .optional(),
});

export async function POST(request: Request) {
  try {
    const { removeImages } = queryValidator.parse(
      Object.fromEntries(new URL(request.url).searchParams)
    );
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return createFailResponse(
        {
          title: 'Missing file',
          message: 'No file to upload',
        },
        StatusCodes.UNPROCESSABLE_ENTITY
      );
    }

    let completeRemovedImageDelete = false;
    const requestImageDelete = !!removeImages?.length;
    if (requestImageDelete) {
      await supabase.storage
        .from('images')
        .remove(removeImages)
        .then(() => {
          completeRemovedImageDelete = true;
        })
        .catch(() => {}); //do nothing on failed
    }

    let fileName =
      file.name ||
      `${uuid4()}-${new Date().toTimeString()}.${file.type
        .split('/dashboard')
        .pop()}`;

    if (/!\.(jpeg|png)$/.test(fileName)) {
      return createFailResponse(
        {
          title: 'Invalid Image',
          message: 'This image type is not supported',
        },
        StatusCodes.UNPROCESSABLE_ENTITY
      );
    }

    await supabase.storage.from('images').upload(`profile/${fileName}`, file);
    const {
      data: { publicUrl },
    } = supabase.storage.from('images').getPublicUrl(`profile/${fileName}`);
    return createSuccessResponse(
      {
        title: 'Upload complete',
        message: 'Image is upload successfully',
        data: {
          url: publicUrl,
          ...(requestImageDelete && { completeRemovedImageDelete }),
        },
      },
      StatusCodes.OK
    );
  } catch (e) {
    console.log('[UPLOAD IMAGE FAILED]', e);
    return createFailResponse(
      {
        title: 'Internal Server Error',
        message: 'Something happen while uploading image',
      },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
