import type { ProductFieldsFragment } from '@/infra/shopify/storefront';

import Option from './Option';

type OptionValues = ProductFieldsFragment['options'][number]['optionValues'][number];

const Options = ({
  options,
  onClick,
  isOptionOutOfStock,
  styles,
  isOptionSelected,
}: {
  options: ProductFieldsFragment['options'];
  isOptionSelected?: (name: string, value: OptionValues) => boolean;
  onClick: (id: string, name: string, value: OptionValues) => void;
  isOptionOutOfStock: (id: string, value: OptionValues) => boolean;
  styles?: string;
}) =>
  Array.isArray(options) && (
    <div className={styles}>
      {options.map((option) => (
        <Option
          key={option.id}
          option={option}
          onClick={onClick}
          isOptionOutOfStock={isOptionOutOfStock}
          isOptionSelected={isOptionSelected}
        />
      ))}
    </div>
  );

export default Options;
