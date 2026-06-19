import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { auth } from '@/auth';

const f = createUploadthing();

export const ourFileRouter = {
  avatarUploader: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(async () => {
      try {
        const session = await auth();
        if (!session?.user?.email) {
          throw new Error('User not authenticated');
        }
        return { email: session.user.email };
      } catch (error) {
        console.error('[UploadThing Middleware Error]', error);
        throw new Error('Authentication failed for upload');
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        return { url: file.url, email: metadata.email };
      } catch (error) {
        console.error('[UploadThing Complete Error]', error);
        throw new Error('Upload completion failed');
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
