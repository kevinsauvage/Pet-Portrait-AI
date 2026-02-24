import {
  Camera,
  ImageIcon,
  Palette,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from 'lucide-react';

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

export const SHOP_HOW_IT_WORKS = [
  {
    icon: ImageIcon,
    title: 'Browse Collections',
    description: 'Find the print format that fits your space.',
    time: '1 minute',
  },
  {
    icon: Camera,
    title: 'Add Your Photo',
    description: 'Upload your pet photo for personalization.',
    time: '1 minute',
  },
  {
    icon: ShieldCheck,
    title: 'Review & Approve',
    description: 'Confirm the preview before you check out.',
    time: '1-2 minutes',
  },
  {
    icon: Truck,
    title: 'Checkout & Delivery',
    description: 'Complete your order and track delivery.',
    time: '2 minutes',
  },
] as const;

export const TRANSFORMATION_SAMPLE = {
  before: {
    src: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200',
    alt: 'Original pet photo of a golden retriever',
    label: 'Original photo',
  },
  after: {
    src: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200',
    alt: 'Stylized pet portrait of a poodle',
    label: 'AI portrait',
  },
  caption: 'Drag the slider to reveal the transformation.',
} as const;

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
