import {
  Camera,
  ImageIcon,
  Palette,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from 'lucide-react';

export const HOME_FEATURES = [
  {
    icon: Camera,
    title: 'Upload a Photo',
    description: 'Snap a picture of your furry friend or choose from your gallery.',
  },
  {
    icon: Palette,
    title: 'Pick a Style',
    description: 'Renaissance, watercolor, pop art — 8 artistic styles to choose from.',
  },
  {
    icon: Truck,
    title: 'Get It Delivered',
    description: 'Printed on premium canvas or poster, shipped free to your door.',
  },
] as const;

export const HOME_HERO_PERKS = [
  { icon: Sparkles, label: 'Museum-grade prints' },
  { icon: ShieldCheck, label: 'Satisfaction guaranteed' },
  { icon: Truck, label: 'Free worldwide shipping' },
] as const;

export const SHOP_PERKS = [
  { label: 'Museum-grade materials', icon: Sparkles },
  { label: 'Multiple print sizes', icon: ImageIcon },
  { label: 'Fast worldwide shipping', icon: ShoppingBag },
] as const;

export const GALLERY_ITEMS = [
  {
    id: '1',
    style: 'Pixar',
    petType: 'Golden Retriever',
    theme: 'Playful',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
  },
  {
    id: '2',
    style: 'Watercolor',
    petType: 'Cat',
    theme: 'Dreamy',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600',
  },
  {
    id: '3',
    style: 'Anime',
    petType: 'Husky',
    theme: 'Adventure',
    image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600',
  },
  {
    id: '4',
    style: 'Royal',
    petType: 'Poodle',
    theme: 'Regal',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600',
  },
  {
    id: '5',
    style: 'Cyberpunk',
    petType: 'German Shepherd',
    theme: 'Neon',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600',
  },
  {
    id: '6',
    style: 'Pixar',
    petType: 'Cat',
    theme: 'Whimsical',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600',
  },
] as const;
