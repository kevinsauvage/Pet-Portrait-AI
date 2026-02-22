import type { Metadata } from 'next';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/lib/server/metadata';
import Breadcrumbs from '@/ui/components/Breadcrumbs';
import PageBanner from '@/ui/components/PageBanner';

import ContactForm from './_components/ContactForm';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.pages.contact.title,
  description: seo.pages.contact.description,
  url: config.routes.contact,
});

const ContactPage = () => {
  const { title, description } = seo.pages.contact || {};
  return (
    <div>
      <PageBanner title={title} description={description}>
        <Breadcrumbs />
      </PageBanner>
      <ContactForm />
    </div>
  );
};

export default ContactPage;
