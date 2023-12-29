import { db } from '@/config/db/client';
import { users } from '@/config/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { createFailResponse, createSuccessResponse } from '@/lib/response';
import { supabase } from '@/lib/supabase';
import { eq } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuid4 } from 'uuid';

export const POST = async (req: Request) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return createFailResponse(
        {
          title: 'Unauthorized',
          message: 'user not authenicated. Reauthenicated to access resource',
        },
        StatusCodes.UNAUTHORIZED
      );
    }
    const data = await req.formData();
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

    const [updatedUser] = await db
      .update(users)
      .set({ imageUrl: publicUrl })
      .where(eq(users.id, user.id!))
      .returning({ imageUrl: users.imageUrl });

    if (user.imageUrl) {
      await supabase.storage
        .from('images')
        .remove([user.imageUrl.replace(/^.*?(?=\/(profile.*$)).*$/, '$1')])
        .catch(() => {});
    }

    return createSuccessResponse(
      {
        title: 'Upload complete',
        message: 'Image is upload successfully',
        data: {
          url: updatedUser.imageUrl,
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
};
