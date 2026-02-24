import type { Metadata } from 'next';
import Link from 'next/link';

import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { AI_ART_STYLES } from '@/domains/ai/ai-portrait/types';
import StylePreview from '@/ui/components/create/StylePreview';
import PageBanner from '@/ui/components/shared/PageBanner';
import { Button } from '@/ui/primitives/button';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.styles.title,
  description: seo.styles.description,
  url: '/styles',
});

const StylesPage = () => {
  return (
    <div>
      <PageBanner
        title="Portrait Styles"
        description="Each style transforms your pet into unique artwork. Pick the one that matches your vision."
      />

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {AI_ART_STYLES.map((style, i) => (
            <StylePreview key={style.id} style={style} index={i} />
          ))}
        </div>

        <div className="mt-16 md:mt-20 text-center">
          <Button
            size="lg"
            asChild
            className="px-8 py-6 text-base shadow-lg hover:shadow-xl transition-shadow"
          >
            <Link href="/create">Create Your Portrait</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StylesPage;
