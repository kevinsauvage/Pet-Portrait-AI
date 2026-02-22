type UploadThingFile = {
  ufsUrl?: string | null;
  appUrl?: string | null;
  url?: string | null;
};

export function getUploadUrl(file?: UploadThingFile | null): string | undefined {
  if (!file) return undefined;
  return file.ufsUrl ?? file.appUrl ?? file.url ?? undefined;
}
