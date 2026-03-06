import ProtectedImage from '@/ui/components/media/ProtectedImage';

interface CreateFlowArtworkPreviewProps {
  artwork: string;
  size?: 'sm' | 'md';
  alt?: string;
}

export default function CreateFlowArtworkPreview({
  artwork,
  size = 'sm',
  alt = 'Your selected portrait',
}: CreateFlowArtworkPreviewProps) {
  const sizeClasses = size === 'sm' ? 'h-16 w-16' : 'h-24 w-24';
  const sizes = size === 'sm' ? '64px' : '96px';

  return (
    <div className={`relative ${sizeClasses} shrink-0 overflow-hidden rounded-xl border shadow-sm`}>
      <ProtectedImage src={artwork} alt={alt} fill sizes={sizes} />
    </div>
  );
}
