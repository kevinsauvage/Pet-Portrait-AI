export interface GenerationLogEntry {
  id: string;
  styleId: string;
  generationId: string;
  timestamp: string;
  status: 'success' | 'failed';
  error?: string;
  originalPhotoUrl?: string;
}
