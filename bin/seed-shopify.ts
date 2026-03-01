import 'dotenv/config';
import { adminClient } from '../src/infra/shopify/client';
import { gql } from 'graphql-request';

const COLLECTION_CREATE_MUTATION = gql`
  mutation collectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection { id title handle }
      userErrors { field message }
    }
  }
`;

const PRODUCT_CREATE_MUTATION = gql`
  mutation productCreate($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
    productCreate(product: $product, media: $media) {
      product {
        id title handle
        variants(first: 10) { edges { node { id title sku } } }
      }
      userErrors { field message }
    }
  }
`;

const PRODUCT_VARIANTS_BULK_UPDATE_MUTATION = gql`
  mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      product { id variants(first: 20) { edges { node { id title sku } } } }
      userErrors { field message }
    }
  }
`;

const PRODUCT_VARIANTS_BULK_CREATE_MUTATION = gql`
  mutation productVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkCreate(productId: $productId, variants: $variants) {
      product { id variants(first: 20) { edges { node { id title sku } } } }
      userErrors { field message }
    }
  }
`;

const COLLECTION_ADD_PRODUCTS_MUTATION = gql`
  mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
    collectionAddProducts(id: $id, productIds: $productIds) {
      collection { id title }
      userErrors { field message }
    }
  }
`;

const GET_COLLECTIONS_QUERY = gql`
  query getCollections($first: Int!) {
    collections(first: $first) {
      edges { node { id title handle } }
    }
  }
`;

type VariantDef = { sku: string; price: string; optionValue: string };

type ProductDef = {
  title: string;
  descriptionHtml: string;
  productType: string;
  imageUrl: string;
  price?: string;
  sku?: string;
  inventoryPolicy?: string;
  options?: { name: string; values: { name: string }[] }[];
  variants?: VariantDef[];
};

const COLLECTIONS = [
  { title: 'AI Pet Portraits', descriptionHtml: 'Custom AI-generated pet portraits.' },
  { title: 'Wall Art', descriptionHtml: 'Canvas and poster prints for your home.' },
];

const PRODUCTS: ProductDef[] = [
  {
    title: 'Digital AI Pet Portrait',
    descriptionHtml: 'High-resolution digital download delivered via email.',
    productType: 'Digital',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1080',
    price: '29.99',
    sku: 'AI-DIGITAL',
    inventoryPolicy: 'DENY',
  },
  {
    title: 'Canvas Print',
    descriptionHtml: 'Premium canvas print, multiple sizes. Fulfilled by Gelato.',
    productType: 'Physical',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1080',
    options: [{ name: 'Size', values: [{ name: '12x12' }, { name: '16x20' }, { name: '24x24' }] }],
    variants: [
      { sku: 'CANVAS-12X12', price: '49.00', optionValue: '12x12' },
      { sku: 'CANVAS-16X20', price: '79.00', optionValue: '16x20' },
      { sku: 'CANVAS-24X24', price: '109.00', optionValue: '24x24' },
    ],
  },
  {
    title: 'Poster / Art Print',
    descriptionHtml: 'High-quality art print. Fulfilled by Gelato.',
    productType: 'Physical',
    imageUrl: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=1080',
    options: [{ name: 'Size', values: [{ name: '12x12' }, { name: '16x20' }, { name: '24x24' }] }],
    variants: [
      { sku: 'POSTER-12X12', price: '29.00', optionValue: '12x12' },
      { sku: 'POSTER-16X20', price: '49.00', optionValue: '16x20' },
      { sku: 'POSTER-24X24', price: '69.00', optionValue: '24x24' },
    ],
  },
];

async function ensureCollections(): Promise<Record<string, string>> {
  const result: any = await adminClient().request(GET_COLLECTIONS_QUERY, { first: 50 });
  const existing = result.collections.edges.map((e: any) => e.node);
  const ids: Record<string, string> = {};

  for (const col of COLLECTIONS) {
    let id = existing.find((c: any) => c.title === col.title)?.id;
    if (!id) {
      console.log(`Creating collection "${col.title}"...`);
      const res: any = await adminClient().request(COLLECTION_CREATE_MUTATION, { input: col });
      if (res.collectionCreate.userErrors.length > 0) {
        console.error(`Failed to create "${col.title}":`, res.collectionCreate.userErrors);
        continue;
      }
      id = res.collectionCreate.collection.id;
      console.log(`Created: ${col.title} (${id})`);
    } else {
      console.log(`Exists: "${col.title}" (${id})`);
    }
    ids[col.title] = id;
  }

  return ids;
}

async function createProduct(product: ProductDef): Promise<string | null> {
  console.log(`Creating "${product.title}"...`);

  const res: any = await adminClient().request(PRODUCT_CREATE_MUTATION, {
    product: {
      title: product.title,
      descriptionHtml: product.descriptionHtml,
      vendor: 'AI Pet Portrait Store',
      productType: product.productType,
      status: 'ACTIVE',
      productOptions: product.options ?? [],
    },
    media: [{ alt: product.title, mediaContentType: 'IMAGE', originalSource: product.imageUrl }],
  });

  if (res.productCreate.userErrors.length > 0) {
    console.error(`Failed to create "${product.title}":`, res.productCreate.userErrors);
    return null;
  }

  const pid = res.productCreate.product.id;
  const firstVariantId = res.productCreate.product.variants.edges[0]?.node?.id;

  if (firstVariantId && product.variants?.length) {
    await adminClient().request(PRODUCT_VARIANTS_BULK_UPDATE_MUTATION, {
      productId: pid,
      variants: [{ id: firstVariantId, price: product.variants[0]!.price, inventoryItem: { sku: product.variants[0]!.sku } }],
    });

    if (product.variants.length > 1) {
      await adminClient().request(PRODUCT_VARIANTS_BULK_CREATE_MUTATION, {
        productId: pid,
        variants: product.variants.slice(1).map((v) => ({
          optionValues: [{ optionName: 'Size', name: v.optionValue }],
          price: v.price,
          inventoryItem: { sku: v.sku },
        })),
      });
    }
  } else if (firstVariantId) {
    await adminClient().request(PRODUCT_VARIANTS_BULK_UPDATE_MUTATION, {
      productId: pid,
      variants: [{ id: firstVariantId, price: product.price, inventoryPolicy: product.inventoryPolicy, inventoryItem: { sku: product.sku } }],
    });
  }

  console.log(`Created: ${product.title} (${pid})`);
  return pid;
}

async function seed() {
  console.log('Starting Shopify seed...\n');

  try {
    const collectionIds = await ensureCollections();

    const productIds: string[] = [];
    for (const product of PRODUCTS) {
      const pid = await createProduct(product);
      if (pid) productIds.push(pid);
    }

    if (productIds.length > 0) {
      for (const [title, id] of Object.entries(collectionIds)) {
        console.log(`Linking products to "${title}"...`);
        const res: any = await adminClient().request(COLLECTION_ADD_PRODUCTS_MUTATION, { id, productIds });
        if (res.collectionAddProducts.userErrors.length > 0) {
          console.error(`Failed to link to "${title}":`, res.collectionAddProducts.userErrors);
        }
      }
    }

    console.log('\nSeed complete.');
  } catch (error) {
    console.error('Seed failed:', error);
  }
}

seed();
