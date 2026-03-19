export const AI_ART_STYLES = [
  {
    id: 'pixar',
    name: 'Pixar',
    label: 'Pixar 3D',
    description: '3D animated character style — cute, expressive, and full of personality.',
    promptSuffix:
      'in Pixar 3D CGI style — smooth rounded fur, large expressive eyes, warm studio lighting, vibrant saturated colors',
    previewImage: 'https://i5xe50sg8q.ufs.sh/f/i69tL0DBn6KI1xQkwAJ1tMpRoNGZhynuH9S7TQcI6BKW8Uzq',
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    label: 'Watercolor',
    description: 'Soft, artistic watercolor painting with flowing colors and gentle edges.',
    promptSuffix:
      'as a loose watercolor painting — soft wet-on-wet washes, visible paper texture, delicate ink outlines, pastel tones bleeding into white space',
    previewImage: 'https://i5xe50sg8q.ufs.sh/f/i69tL0DBn6KIPYADzwyTqg4thxQiG5sOA7nH2fEjLTUbJluc',
  },
  {
    id: 'anime',
    name: 'Anime',
    label: 'Anime',
    description: 'Japanese anime illustration — detailed, vibrant, and full of energy.',
    promptSuffix:
      'in Japanese anime style — clean cel-shaded linework, bold outlines, vivid flat colors, expressive oversized eyes, soft gradient shading',
    previewImage: 'https://i5xe50sg8q.ufs.sh/f/i69tL0DBn6KIaj6iKF21UtsOxP7jM53fbpyIarg0oRwFledq',
  },
  {
    id: 'royal',
    name: 'Royal',
    label: 'Royal Oil',
    description: 'Classical oil painting portrait — ornate, baroque, and majestic.',
    promptSuffix:
      'as a 17th-century royal oil painting — rich impasto texture, dramatic Rembrandt lighting, deep jewel-tone background, gilded ornate frame visible at edges',
    previewImage: 'https://i5xe50sg8q.ufs.sh/f/i69tL0DBn6KIA0HNFJeNAfVXGKqSvP1UlasDtO5Fz0gb9pui',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    label: 'Cyberpunk',
    description: 'Neon-lit futuristic style — sleek, bold, and electric.',
    promptSuffix:
      'in cyberpunk style — neon magenta and cyan rim lighting, rain-slicked dark background, chrome implants or visor details, moody film-grain atmosphere',
    previewImage: 'https://i5xe50sg8q.ufs.sh/f/i69tL0DBn6KIqT9UgONBuat4FQX9YxKifg0D2eMALPWbyvHT',
  },
  {
    id: 'renaissance',
    name: 'Renaissance',
    label: 'Renaissance',
    description:
      'Inspired by the great masters — rich detail, dramatic lighting, timeless elegance.',
    promptSuffix:
      'in Italian Renaissance style — precise glazed oil technique, sfumato soft-focus edges, warm umber undertones, subtle chiaroscuro, classical neutral background',
    previewImage: 'https://i5xe50sg8q.ufs.sh/f/i69tL0DBn6KIoM1F64Ry3q4uRN1mtnZvgWMiezE8OICcwKX2',
  },
  {
    id: 'pop-art',
    name: 'Pop Art',
    label: 'Pop Art',
    description: 'Bold, colorful pop art in the style of Warhol and Lichtenstein.',
    promptSuffix:
      'in 1960s pop art style — bold Ben-Day halftone dots, thick black outlines, flat unmixed primary colors, high contrast, Andy Warhol screen-print aesthetic',
    previewImage: 'https://i5xe50sg8q.ufs.sh/f/i69tL0DBn6KIYZdpVLreDqgs5acPnB0FNt9lbWi7L3K8jpvk',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    label: 'Minimalist',
    description: 'Clean lines and simple shapes — modern and elegant.',
    promptSuffix:
      'in minimalist vector art style — flat two- or three-tone color palette, clean geometric silhouette, no gradients, generous white negative space, Scandinavian design aesthetic',
    previewImage: 'https://i5xe50sg8q.ufs.sh/f/i69tL0DBn6KIlM0NIZoxs3W98yChRrSIdp2lmqLB4PYv6auk',
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
  printful_print_url: string;
  original_photo_url: string;
  chosen_style: string;
  generation_id: string;
  product_type?: string;
}

/**
 * Client-side image constraints for zod schema validation.
 * Note: These should match the shop config values for consistency.
 * Server-side validation uses shop config directly (see validate-image.ts).
 * This constant is used in client components where async shop config is not available.
 */
export const IMAGE_CONSTRAINTS = {
  maxFileSize: 8 * 1024 * 1024,
  minDimension: 200,
  maxDimension: 4096,
  minAspectRatio: 0.5,
  maxAspectRatio: 2.5,
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
} as const;
