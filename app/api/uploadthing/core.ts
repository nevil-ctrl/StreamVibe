import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { auth } from '@/auth';

const f = createUploadthing();

export const ourFileRouter = {
  avatarUploader: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.email) throw new Error('Unauthorized');
      return { email: session.user.email };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url, email: metadata.email };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
