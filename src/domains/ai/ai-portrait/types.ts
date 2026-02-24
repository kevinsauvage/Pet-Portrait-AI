export const AI_ART_STYLES = [
  {
    id: 'pixar',
    name: 'Pixar',
    label: 'Pixar 3D',
    description: '3D animated character style — cute, expressive, and full of personality.',
    promptSuffix: 'in Pixar 3D CGI style — smooth rounded fur, large expressive eyes, warm studio lighting, vibrant saturated colors',
    previewImage: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    label: 'Watercolor',
    description: 'Soft, artistic watercolor painting with flowing colors and gentle edges.',
    promptSuffix: 'as a loose watercolor painting — soft wet-on-wet washes, visible paper texture, delicate ink outlines, pastel tones bleeding into white space',
    previewImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600',
  },
  {
    id: 'anime',
    name: 'Anime',
    label: 'Anime',
    description: 'Japanese anime illustration — detailed, vibrant, and full of energy.',
    promptSuffix: 'in Japanese anime style — clean cel-shaded linework, bold outlines, vivid flat colors, expressive oversized eyes, soft gradient shading',
    previewImage: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600',
  },
  {
    id: 'royal',
    name: 'Royal',
    label: 'Royal Oil',
    description: 'Classical oil painting portrait — ornate, baroque, and majestic.',
    promptSuffix: 'as a 17th-century royal oil painting — rich impasto texture, dramatic Rembrandt lighting, deep jewel-tone background, gilded ornate frame visible at edges',
    previewImage: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    label: 'Cyberpunk',
    description: 'Neon-lit futuristic style — sleek, bold, and electric.',
    promptSuffix: 'in cyberpunk style — neon magenta and cyan rim lighting, rain-slicked dark background, chrome implants or visor details, moody film-grain atmosphere',
    previewImage: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600',
  },
  {
    id: 'renaissance',
    name: 'Renaissance',
    label: 'Renaissance',
    description: 'Inspired by the great masters — rich detail, dramatic lighting, timeless elegance.',
    promptSuffix: 'in Italian Renaissance style — precise glazed oil technique, sfumato soft-focus edges, warm umber undertones, subtle chiaroscuro, classical neutral background',
    previewImage: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600',
  },
  {
    id: 'pop-art',
    name: 'Pop Art',
    label: 'Pop Art',
    description: 'Bold, colorful pop art in the style of Warhol and Lichtenstein.',
    promptSuffix: 'in 1960s pop art style — bold Ben-Day halftone dots, thick black outlines, flat unmixed primary colors, high contrast, Andy Warhol screen-print aesthetic',
    previewImage: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    label: 'Minimalist',
    description: 'Clean lines and simple shapes — modern and elegant.',
    promptSuffix: 'in minimalist vector art style — flat two- or three-tone color palette, clean geometric silhouette, no gradients, generous white negative space, Scandinavian design aesthetic',
    previewImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600',
  },
] as const;

export type ArtStyle = (typeof AI_ART_STYLES)[number];
export type ArtStyleId = ArtStyle['id'];

const STYLE_IDS = AI_ART_STYLES.map((s) => s.id);

export function isValidStyleId(val: unknown): val is ArtStyleId {
  return typeof val === 'string' && STYLE_IDS.includes(val as ArtStyleId);
}

export function validStyleIdsLabel(): string {
  return STYLE_IDS.join(', ');
}

export interface ArtworkGenerationInput {
  originalPhotoUrl: string;
  styleId: ArtStyleId;
  generationId: string;
}

export interface ArtworkGenerationResult {
  urls: string[];
  generationId: string;
  styleId: ArtStyleId;
}

export interface CartLineArtworkAttributes {
  original_photo_url: string;
  final_artwork_url: string;
  chosen_style: string;
  generation_id: string;
  product_type?: 'digital' | 'canvas' | 'poster';
}

export const IMAGE_CONSTRAINTS = {
  maxFileSize: 8 * 1024 * 1024,
  minDimension: 200,
  maxDimension: 4096,
  minAspectRatio: 0.5,
  maxAspectRatio: 2.5,
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
} as const;
