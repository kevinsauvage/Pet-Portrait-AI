import type { SelectedOption } from '@/modules/shopify/admin';
import type { FilterValue } from '@/modules/shopify/storefront';

export const isOptionSelected = (
  name: string,
  optionValue: SelectedOption['value'],
  selectedProductOption: SelectedOption[] | undefined,
) => {
  if (selectedProductOption?.length) {
    return selectedProductOption?.some(
      (option) => option.name === name && option.value === optionValue,
    );
  }
  return false;
};

export const getDifference = (
  array1: SelectedOption[] | undefined,
  array2: SelectedOption[] | undefined,
) => {
  const difference = array1?.filter(
    (object1) =>
      !array2?.some((object2) => object1.name === object2.name && object1.value === object2.value),
  );

  return !!difference?.length;
};

const colors = new Set([
  'black',
  'blue',
  'brown',
  'gray',
  'green',
  'orange',
  'pink',
  'purple',
  'red',
  'white',
  'yellow',
  'gold',
  'silver',
  'bronze',
  'beige',
  'maroon',
  'olive',
  'navy',
  'turquoise',
  'violet',
  'indigo',
  'magenta',
  'crimson',
  'teal',
  'aquamarine',
  'chartreuse',
  'coral',
  'fuchsia',
  'khaki',
  'lavender',
  'lime',
  'mustard',
  'peach',
  'salmon',
  'sienna',
]);

export const extractUniqueColorNames = (data: FilterValue[]) => {
  const colorMap = new Map();

  data.forEach((item) => {
    const color = item.label
      .toLowerCase()
      .split(' ')
      .filter((word) => colors.has(word));
    if (color.length > 0) {
      colorMap.set(color[0], { ...item, label: color[0] });
    }
  });

  return [...colorMap.values()] as FilterValue[];
};
