import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

const imageEndpoint = (maxFileCount: number) =>
  f({ image: { maxFileSize: '8MB', maxFileCount } })
    .middleware(async () => ({}))
    .onUploadComplete(async ({ file }) => ({ url: file.url, key: file.key }));

export const ourFileRouter = {
  userUpload: imageEndpoint(1),
  generatedArt: imageEndpoint(6),
  ordersArt: imageEndpoint(1),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
