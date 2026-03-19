import { Camera, Palette, ShoppingBag, Sparkles } from 'lucide-react';

export const CREATE_HOW_IT_WORKS = [
  {
    icon: Camera,
    title: 'Upload a Photo',
    description: 'Choose a clear, well-lit photo of your pet.',
    time: '30 seconds',
  },
  {
    icon: Palette,
    title: 'Pick a Style',
    description: 'Select from 8 artistic styles tailored to pets.',
    time: '1 minute',
  },
  {
    icon: Sparkles,
    title: 'AI Generates Options',
    description: 'We create 6 portraits for you to review.',
    time: '1-2 minutes',
  },
  {
    icon: ShoppingBag,
    title: 'Choose Format & Checkout',
    description: 'Select canvas, poster, or digital download.',
    time: '2 minutes',
  },
] as const;

/**
 * Before/After transformation samples for each AI art style
 * The before image is always the same placeholder image
 * TODO: Replace placeholder after images with actual style-specific transformations
 */
const COMMON_BEFORE_IMAGE = {
  src: '/placeholder-before.jpg',
  alt: 'Original pet photo',
  label: 'Original photo',
} as const;

export const STYLE_TRANSFORMATIONS = {
  pixar: {
    before: COMMON_BEFORE_IMAGE,
    after: {
      src: 'https://i5xe50sg8q.ufs.sh/f/i69tL0DBn6KIAQd8u4eNAfVXGKqSvP1UlasDtO5Fz0gb9pui',
      alt: 'Pixar 3D style pet portrait',
      label: 'Pixar 3D',
    },
  },
  watercolor: {
    before: COMMON_BEFORE_IMAGE,
    after: {
      src: 'https://i5xe50sg8q.ufs.sh/f/i69tL0DBn6KIirPVCtBn6KIzr3G1hcqZvUaYR50iuMOQjeWS',
      alt: 'Watercolor style pet portrait',
      label: 'Watercolor',
    },
  },
  anime: {
    before: COMMON_BEFORE_IMAGE,
    after: {
      src: 'https://i5xe50sg8q.ufs.sh/f/i69tL0DBn6KIkRKUXdqGuTvHQEdlB5kirKnXwSsjIoR91hqD',
      alt: 'Anime style pet portrait',
      label: 'Anime',
    },
  },
  royal: {
    before: COMMON_BEFORE_IMAGE,
    after: {
      src: 'https://i5xe50sg8q.ufs.sh/f/i69tL0DBn6KIvQTBpLtPwQI75yEpDhslkqCTaV3cHz8GR6oS',
      alt: 'Royal oil painting style pet portrait',
      label: 'Royal Oil',
    },
  },
  cyberpunk: {
    before: COMMON_BEFORE_IMAGE,
    after: {
      src: 'https://i5xe50sg8q.ufs.sh/f/i69tL0DBn6KIwDWngN9mhceYwVviAoBbLrMzT548uJGZSqpx',
      alt: 'Cyberpunk style pet portrait',
      label: 'Cyberpunk',
    },
  },
  renaissance: {
    before: COMMON_BEFORE_IMAGE,
    after: {
      src: 'https://i5xe50sg8q.ufs.sh/f/i69tL0DBn6KIOiMedDzmIrVcubaM50D1P6GxJRkKdCe8wW4o',
      alt: 'Renaissance style pet portrait',
      label: 'Renaissance',
    },
  },
  'pop-art': {
    before: COMMON_BEFORE_IMAGE,
    after: {
      src: 'https://i5xe50sg8q.ufs.sh/f/i69tL0DBn6KIOkBGLEfzmIrVcubaM50D1P6GxJRkKdCe8wW4',
      alt: 'Pop Art style pet portrait',
      label: 'Pop Art',
    },
  },
  minimalist: {
    before: COMMON_BEFORE_IMAGE,
    after: {
      src: 'https://i5xe50sg8q.ufs.sh/f/i69tL0DBn6KIcxp9VtAjYKeHqx7SwhMXvsTyF5nr1kzJZAom',
      alt: 'Minimalist style pet portrait',
      label: 'Minimalist',
    },
  },
} as const;

export const GALLERY_ITEMS = [
  {
    id: '1',
    style: 'Pixar',
    petType: 'Golden Retriever',
    image: 'https://i5xe50sg8q.ufs.sh/f/i69tL0DBn6KIrA4zRCkuHwUdgpkyF4Lq5ivR0umtYMVISXo9',
  },
  {
    id: '2',
    style: 'Watercolor',
    petType: 'Main coon',
    image: 'https://i5xe50sg8q.ufs.sh/f/i69tL0DBn6KIYbIIjUreDqgs5acPnB0FNt9lbWi7L3K8jpvk',
  },
  {
    id: '3',
    style: 'Anime',
    petType: 'Husky',
    image: 'https://i5xe50sg8q.ufs.sh/f/i69tL0DBn6KIAlEgjV3eNAfVXGKqSvP1UlasDtO5Fz0gb9pu',
  },
  {
    id: '4',
    style: 'Royal Oil',
    petType: 'Poodle',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600',
  },
  {
    id: '5',
    style: 'Cyberpunk',
    petType: 'German Shepherd',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600',
  },
  {
    id: '6',
    style: 'Pixar',
    petType: 'Cat',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600',
  },
] as const;
