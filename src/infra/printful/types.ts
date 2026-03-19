/**
 * Printful API types for mockup generation
 * @see https://developers.printful.com/docs/#tag/Mockup-Generator-API
 */

/** Params for preview generation (shared by service and client) */
export interface PrintfulPreviewParams {
  variantId: number;
  artworkUrl: string;
}

export interface PrintfulPreviewResult {
  previewUrl: string;
}

export interface PrintfulPrintfile {
  printfile_id: number;
  width: number;
  height: number;
  dpi: number;
  fill_mode: 'fit' | 'cover';
  can_rotate: boolean;
}

export interface PrintfulPrintfilesResponse {
  product_id: number;
  available_placements: Record<string, string>;
  printfiles: PrintfulPrintfile[];
  variant_printfiles: Array<{
    variant_id: number;
    placements: Record<string, number>;
  }>;
}

export interface PrintfulCreateTaskResponse {
  task_key: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface PrintfulTaskResultResponse {
  task_key: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
  mockups?: Array<{
    variant_ids: number[];
    placement: string;
    mockup_url: string;
  }>;
}
