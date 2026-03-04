import type { Metadata } from 'next';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import ContactForm from '@/ui/components/shared/ContactForm';
import PageBanner from '@/ui/components/shared/PageBanner';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.pages.contact.title,
  description: seo.pages.contact.description,
  url: config.routes.contact,
});

const ContactPage = () => {
  const { title, description } = seo.pages.contact || {};
  return (
    <div>
      <PageBanner title={title} description={description} />
      <ContactForm />
    </div>
  );
};

export default ContactPage;
