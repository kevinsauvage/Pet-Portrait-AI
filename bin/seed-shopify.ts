import 'dotenv/config';
import { adminClient } from '../src/infra/shopify/client';
import { gql } from 'graphql-request';

const COLLECTION_CREATE_MUTATION = gql`
  mutation collectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection {
        id
        title
        handle
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const PRODUCT_CREATE_MUTATION = gql`
  mutation productCreate($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
    productCreate(product: $product, media: $media) {
      product {
        id
        title
        handle
        variants(first: 10) {
          edges {
            node {
              id
              title
              sku
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const PRODUCT_VARIANTS_BULK_UPDATE_MUTATION = gql`
  mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      product {
        id
        variants(first: 20) {
          edges {
            node {
              id
              title
              sku
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const PRODUCT_VARIANTS_BULK_CREATE_MUTATION = gql`
  mutation productVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkCreate(productId: $productId, variants: $variants) {
      product {
        id
        variants(first: 20) {
          edges {
            node {
              id
              title
              sku
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const COLLECTION_ADD_PRODUCTS_MUTATION = gql`
  mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
    collectionAddProducts(id: $id, productIds: $productIds) {
      collection {
        id
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const GET_COLLECTIONS_QUERY = gql`
  query getCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }
`;

const ACCESS_SCOPES_QUERY = gql`
  query {
    currentAppInstallation {
      accessScopes {
        handle
      }
    }
  }
`;

async function seed() {
  console.log('🚀 Starting Shopify Seeding...');

  try {
    // 0. Check scopes
    console.log('🔍 Checking access scopes...');
    try {
      const scopeResult: any = await adminClient().request(ACCESS_SCOPES_QUERY);
      console.log('🚀 ~ seed ~ scopeResult:', scopeResult);
      const scopes = scopeResult.currentAppInstallation.accessScopes.map((s: any) => s.handle);
      console.log('✅ Current Scopes:', scopes.join(', '));

      const required = ['read_products', 'write_products'];
      const missing = required.filter((r) => !scopes.includes(r));
      if (missing.length > 0) {
        console.warn(`⚠️ Missing recommended scopes: ${missing.join(', ')}`);
        console.warn('Please ensure these are enabled in your Shopify Admin -> App Setup.');
      }
    } catch (e) {
      console.warn('⚠️ Could not verify scopes (might be using a restricted token type).');
    }

    // 1. Ensure Collections
    console.log('📦 Ensuring collections exist...');
    const collectionsToEnsure = [
      {
        title: 'Personalized Favourites',
        descriptionHtml: 'Customer-loved pet portrait gifts and best-loved styles.',
      },
      { title: 'Wall Art', descriptionHtml: 'Canvas and poster prints for your home or studio.' },
      { title: 'Phone Cases', descriptionHtml: 'Protect your phone with a custom pet portrait.' },
      { title: 'Mugs & Bottle', descriptionHtml: 'Daily sips with your favorite pet artwork.' },
      { title: 'Tote Bags', descriptionHtml: 'Carry your pet portrait everywhere.' },
      { title: 'Calendars', descriptionHtml: 'A year of pet portraits, month by month.' },
      { title: 'Holiday Season', descriptionHtml: 'Gift-ready portraits for the holidays.' },
    ];

    const collectionsResult: any = await adminClient().request(GET_COLLECTIONS_QUERY, {
      first: 50,
    });
    const existingCollections = collectionsResult.collections.edges.map((e: any) => e.node);
    const collectionIds: Record<string, string> = {};

    for (const col of collectionsToEnsure) {
      let id = existingCollections.find((c: any) => c.title === col.title)?.id;
      if (!id) {
        console.log(`🔨 Creating "${col.title}" collection...`);
        const result: any = await adminClient().request(COLLECTION_CREATE_MUTATION, { input: col });
        if (result.collectionCreate.userErrors.length > 0) {
          console.error(`❌ Error creating "${col.title}":`, result.collectionCreate.userErrors);
          continue;
        }
        id = result.collectionCreate.collection.id;
        console.log(`✅ Collection created: ${col.title} (${id})`);
      } else {
        console.log(`ℹ️ Collection "${col.title}" already exists (${id})`);
      }
      collectionIds[col.title] = id;
    }

    const createdProductIds: string[] = [];

    // 2. Create Products with Images
    const productsData = [
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
        descriptionHtml: 'Premium canvas print, multiple sizes. Shipped via Gelato.',
        productType: 'Physical',
        imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1080',
        options: [
          { name: 'Size', values: [{ name: '12x12' }, { name: '16x20' }, { name: '24x24' }] },
        ],
        variants: [
          { sku: 'CANVAS-12X12', price: '49.00', optionValue: '12x12' },
          { sku: 'CANVAS-16X20', price: '79.00', optionValue: '16x20' },
          { sku: 'CANVAS-24X24', price: '109.00', optionValue: '24x24' },
        ],
      },
      {
        title: 'Poster / Art Print',
        descriptionHtml: 'High-quality art print. Shipped via Gelato.',
        productType: 'Physical',
        imageUrl: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=1080',
        options: [
          { name: 'Size', values: [{ name: '12x12' }, { name: '16x20' }, { name: '24x24' }] },
        ],
        variants: [
          { sku: 'POSTER-12X12', price: '29.00', optionValue: '12x12' },
          { sku: 'POSTER-16X20', price: '49.00', optionValue: '16x20' },
          { sku: 'POSTER-24X24', price: '69.00', optionValue: '24x24' },
        ],
      },
    ];

    for (const pData of productsData) {
      console.log(`🎁 Creating "${pData.title}"...`);
      const productResult: any = await adminClient().request(PRODUCT_CREATE_MUTATION, {
        product: {
          title: pData.title,
          descriptionHtml: pData.descriptionHtml,
          vendor: 'AI Pet Portrait Store',
          productType: pData.productType,
          status: 'ACTIVE',
          productOptions: pData.options || [],
        },
        media: [
          {
            alt: pData.title,
            mediaContentType: 'IMAGE',
            originalSource: pData.imageUrl,
          },
        ],
      });

      if (productResult.productCreate.userErrors.length > 0) {
        console.warn(`⚠️ Error creating "${pData.title}":`, productResult.productCreate.userErrors);
        continue;
      }

      const pid = productResult.productCreate.product.id;
      createdProductIds.push(pid);

      // Handle variants
      const firstVariantId = productResult.productCreate.product.variants.edges[0]?.node?.id;
      if (firstVariantId) {
        if (pData.variants && pData.variants.length > 0) {
          // Update first variant
          const firstV = pData.variants[0]!;
          await adminClient().request(PRODUCT_VARIANTS_BULK_UPDATE_MUTATION, {
            productId: pid,
            variants: [
              {
                id: firstVariantId,
                price: firstV.price,
                inventoryItem: { sku: firstV.sku },
              },
            ],
          });
          // Create other variants
          if (pData.variants.length > 1) {
            await adminClient().request(PRODUCT_VARIANTS_BULK_CREATE_MUTATION, {
              productId: pid,
              variants: pData.variants.slice(1).map((v) => ({
                optionValues: [{ optionName: 'Size', name: v.optionValue! }],
                price: v.price,
                inventoryItem: { sku: v.sku },
              })),
            });
          }
        } else {
          // Digital product single variant
          await adminClient().request(PRODUCT_VARIANTS_BULK_UPDATE_MUTATION, {
            productId: pid,
            variants: [
              {
                id: firstVariantId,
                price: pData.price,
                inventoryPolicy: pData.inventoryPolicy,
                inventoryItem: { sku: pData.sku },
              },
            ],
          });
        }
      }
      console.log(`✅ Product created: ${pData.title} (${pid})`);
    }

    // 3. Add Products to Collections
    if (createdProductIds.length > 0) {
      for (const colTitle of Object.keys(collectionIds)) {
        const id = collectionIds[colTitle];
        console.log(`🔗 Linking products to "${colTitle}"...`);
        const addResult: any = await adminClient().request(COLLECTION_ADD_PRODUCTS_MUTATION, {
          id,
          productIds: createdProductIds,
        });
        if (addResult.collectionAddProducts.userErrors.length > 0) {
          console.error(
            `❌ Error adding to "${colTitle}":`,
            addResult.collectionAddProducts.userErrors,
          );
        } else {
          console.log(`✅ Products linked to "${colTitle}".`);
        }
      }
    }

    console.log('\n✨ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seed();
