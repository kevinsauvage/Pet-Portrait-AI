'use client';

import { useCallback, useEffect, useState } from 'react';

import useCartContext from '@/contexts/CartContext/useCartContext';
import { logger } from '@/core/utils/logger';
import type { GetProductByHandleQuery, ProductFieldsFragment } from '@/infra/shopify/storefront';
type OptionValues = ProductFieldsFragment['options'][number]['optionValues'][number];

type SelectedProductOptionType = {
  id: string;
  name: string;
  optionValues: OptionValues;
};

type ProductVariant = NonNullable<GetProductByHandleQuery['product']>['variants'] extends {
  edges: Array<{ node: infer T }>;
}
  ? T
  : NonNullable<GetProductByHandleQuery['product']>['variants'] extends {
        edges?: Array<{ node?: infer T }>;
      }
    ? T | undefined
    : { id: string; price?: { amount: string } } | undefined;

const useProductSelection = ({
  product,
}: {
  product: GetProductByHandleQuery['product'] | null | undefined;
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>();
  const [selectedProductOption, setSelectedProductOption] = useState<
    SelectedProductOptionType[] | undefined
  >([]);

  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  const { handleAddToCart: handleAddToCartContext } = useCartContext();

  const handleChangeInput = useCallback(
    (number_: number) => {
      setQuantity(number_);
      if (number_ && selectedVariant && 'id' in selectedVariant && 'price' in selectedVariant) {
        const variant = selectedVariant as { id: string; price: { amount: string } };
        const amount = Number(variant.price.amount) * number_;
        setTotalPrice(Number(amount.toFixed(2)));
      }
    },
    [selectedVariant],
  );

  const selectVariantByOptions = useCallback(
    (options: SelectedProductOptionType[]) => {
      const selectedOptions = options.map((option) => ({
        name: option.name,
        value: option.optionValues.name,
      }));

      const selected = product?.variants.edges.find((variant) => {
        const variantOptions = variant.node.selectedOptions;
        return selectedOptions.every((option) =>
          variantOptions.some(
            (variantOption) =>
              variantOption.name === option.name && variantOption.value === option.value,
          ),
        );
      });

      if (selected?.node) {
        setSelectedVariant(selected.node);
      }
    },
    [product],
  );

  const handleSetSelectedProductOption = useCallback(
    (id: string, name: string, optionValues: OptionValues) => {
      setSelectedProductOption((previous) => {
        const newOptions = previous?.map((option) => {
          return option?.name === name ? { ...option, id, optionValues } : option;
        });
        if (newOptions) {
          selectVariantByOptions(newOptions);
        }
        return newOptions;
      });
    },
    [selectVariantByOptions],
  );

  const handleAddToCart = useCallback(() => {
    if (selectedVariant && typeof selectedVariant === 'object' && 'id' in selectedVariant) {
      const variantId = String((selectedVariant as { id: string }).id);
      handleAddToCartContext(variantId, quantity).catch((error) => {
        logger.error('cart.add', error);
      });
    }
  }, [handleAddToCartContext, quantity, selectedVariant]);

  useEffect(() => {
    if (product?.variants?.edges?.[0]?.node) {
      setTimeout(() => {
        setSelectedVariant(product.variants.edges?.[0]?.node);
      }, 0);
    }
    const optionsArray = product?.options || [];
    const mappedOptions = optionsArray.map((option) => {
      if (!option) return { id: '', name: '', optionValues: {} as OptionValues };
      const optionId = (option as { id?: string }).id || '';
      const optionName = (option as { name?: string }).name || '';
      const optionValuesArray =
        (option as { optionValues?: Array<OptionValues> }).optionValues || [];
      return {
        id: optionId,
        name: optionName,
        optionValues: optionValuesArray[0] || ({} as OptionValues),
      };
    });

    setTimeout(() => {
      setSelectedProductOption(mappedOptions);
    }, 0);
    setTimeout(() => {
      selectVariantByOptions(mappedOptions);
    }, 0);
  }, [product, selectVariantByOptions]);

  const isOptionOutOfStock = (name: string, optionValue: OptionValues) => {
    const isOUt = product?.variants.edges.some((variant) => {
      const { selectedOptions } = variant.node;
      return selectedOptions.some(
        (option) => option.name === name && option.value === optionValue?.name,
      );
    });
    return !isOUt;
  };

  const isOptionSelected = (name: string, value: OptionValues) => {
    return (
      selectedProductOption?.some(
        (selectedOption) =>
          selectedOption.name === name && selectedOption.optionValues.name === value.name,
      ) || false
    );
  };

  return {
    handleAddToCart,
    handleChangeInput,
    handleSetSelectedProductOption,
    isOptionOutOfStock,
    isOptionSelected,
    quantity,
    selectedProductOption,
    selectedVariant,
    totalPrice,
  };
};

export default useProductSelection;
