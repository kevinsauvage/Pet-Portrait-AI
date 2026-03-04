import type { Metadata } from 'next';
import Link from 'next/link';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import PageBanner from '@/ui/components/shared/PageBanner';
import MainContent from '@/ui/layouts/MainContent';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/primitives/accordion';
import { Button } from '@/ui/primitives/button';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.pages.faq.title,
  description: seo.pages.faq.description,
  url: config.routes.faq,
});

type FAQItem = {
  question: string;
  answer: string | React.ReactNode;
};

const FAQ_CATEGORIES = [
  {
    title: 'Getting Started',
    items: [
      {
        question: 'How does PetPortrait AI work?',
        answer:
          'Simply upload a photo of your pet, choose from our collection of artistic styles (Pixar, Watercolor, Anime, Royal, and more), and our AI will transform it into a stunning portrait. You can then order it as a digital download, canvas print, poster, or other formats.',
      },
      {
        question: 'What kind of photos work best?',
        answer:
          'Clear, well-lit photos with your pet facing the camera work best. Avoid blurry images or photos where your pet is too far away. The better the quality of the input photo, the more detailed and accurate your portrait will be.',
      },
      {
        question: 'How long does it take to generate a portrait?',
        answer:
          'Portrait generation typically takes about 1-2 minutes. Once generated, you can immediately download the digital version or order physical prints. Physical products ship within 3-5 business days.',
      },
    ],
  },
  {
    title: 'Orders & Products',
    items: [
      {
        question: 'What products are available?',
        answer:
          'We offer digital downloads (instant), canvas prints, posters, framed prints, and more. Each product comes in various sizes to fit your space and budget.',
      },
      {
        question: 'Can I order multiple styles of the same pet?',
        answer:
          'Absolutely! You can generate multiple styles from the same photo and order them all. Many customers create collections featuring their pet in different artistic styles.',
      },
      {
        question: 'Do you offer bulk discounts?',
        answer:
          'Yes! We offer discounts for multiple orders. The more portraits you order, the better the savings. Check our pricing page for current bulk discount rates.',
      },
      {
        question: 'Can I edit or modify my portrait after generation?',
        answer:
          'Once generated, you can regenerate with different styles, but we cannot manually edit individual portraits. However, you can always create a new portrait from a different photo or try a different style.',
      },
    ],
  },
  {
    title: 'Shipping & Delivery',
    items: [
      {
        question: 'How long does shipping take?',
        answer:
          'Digital downloads are instant. Physical products typically ship within 3-5 business days and arrive within 5-10 business days depending on your location. We offer free shipping on all canvas and poster orders.',
      },
      {
        question: 'Do you ship internationally?',
        answer:
          'Yes! We ship worldwide. Shipping times and costs vary by location. You can see estimated delivery times and costs at checkout.',
      },
      {
        question: 'Can I track my order?',
        answer:
          "Yes! Once your order ships, you'll receive a tracking number via email. You can also track your order from your account dashboard.",
      },
      {
        question: 'What if my order arrives damaged?',
        answer:
          "We stand behind our products. If your order arrives damaged, contact us within 7 days and we'll send a replacement free of charge.",
      },
    ],
  },
  {
    title: 'Returns & Refunds',
    items: [
      {
        question: 'What is your refund policy?',
        answer:
          "We offer a 30-day satisfaction guarantee. If you're not happy with your portrait for any reason, contact us for a full refund. Digital downloads are non-refundable once downloaded.",
      },
      {
        question: 'Can I return a physical product?',
        answer:
          "Yes, you can return physical products within 30 days of delivery. Items must be in original condition. We'll provide a prepaid return label and process your refund once we receive the item.",
      },
      {
        question: "What if I don't like my portrait?",
        answer:
          "If you're not satisfied with how your portrait turned out, you can regenerate it with a different style at no extra cost, or request a full refund within 30 days.",
      },
    ],
  },
  {
    title: 'Technical & Privacy',
    items: [
      {
        question: 'How do you use my pet photos?',
        answer:
          'Your photos are used solely to generate your portrait. We never share, sell, or use your photos for any other purpose. All images are securely stored and deleted after 90 days. See our Privacy Policy for full details.',
      },
      {
        question: 'Do I own the rights to my portrait?',
        answer:
          'Yes! Once you purchase a portrait, you own the rights to use it for personal use. Commercial use requires a separate license. See our Terms of Service for details.',
      },
      {
        question: 'What file formats do you provide?',
        answer:
          'Digital downloads come in high-resolution JPEG and PNG formats. Files are optimized for both web and print use.',
      },
      {
        question: 'Can I use my portrait commercially?',
        answer:
          'Personal portraits are for personal use only. If you need commercial licensing (for business use, marketing, etc.), please contact us to discuss licensing options.',
      },
    ],
  },
] satisfies Array<{ title: string; items: FAQItem[] }>;

const FAQPage = () => {
  const { title, description } = seo.pages.faq;

  return (
    <div>
      <PageBanner
        title={title}
        description={description}
        secondaryCtaLabel="Contact Support"
        secondaryCtaHref={config.routes.contact}
      />
      <MainContent className="px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-4xl space-y-8">
          {FAQ_CATEGORIES.map((category, categoryIndex) => (
            <div key={category.title} className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-heading-3 font-semibold tracking-tight text-foreground">
                  {category.title}
                </h2>
                <div className="h-px w-12 rounded-full bg-primary/50" />
              </div>

              <Accordion type="single" collapsible className="w-full space-y-1">
                {category.items.map((item, itemIndex) => {
                  const value = `category-${categoryIndex}-item-${itemIndex}`;
                  return (
                    <AccordionItem
                      key={value}
                      value={value}
                      className="rounded-xl border border-border/60 bg-card/50 px-4 transition-colors hover:bg-card/80"
                    >
                      <AccordionTrigger className="text-left text-body font-medium text-foreground hover:no-underline">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-body-sm leading-relaxed text-muted-foreground">
                        {typeof item.answer === 'string' ? <p>{item.answer}</p> : item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          ))}

          {/* CTA Section */}
          <div className="mt-12 rounded-2xl border border-border/60 bg-card/50 p-8 text-center">
            <h3 className="text-heading-4 font-semibold tracking-tight text-foreground mb-2">
              Still have questions?
            </h3>
            <p className="text-body-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help.
            </p>
            <Button asChild size="lg" className="h-11 px-6">
              <Link href={config.routes.contact}>Contact Support</Link>
            </Button>
          </div>
        </div>
      </MainContent>
    </div>
  );
};

export default FAQPage;
