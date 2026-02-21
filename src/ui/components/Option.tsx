import type { ProductFieldsFragment } from '@/modules/shopify/storefront';
import { Button } from '@/ui/components/ui/button';

type OptionValues = ProductFieldsFragment['options'][number]['optionValues'][number];

const Option = ({
  option,
  onClick,
  isOptionOutOfStock,
  isOptionSelected,
}: {
  option: ProductFieldsFragment['options'][number];
  isOptionSelected?: (name: string, value: OptionValues) => boolean;
  isOptionOutOfStock: (id: string, optionValue: OptionValues) => boolean;
  onClick: (optionId: string, name: string, value: OptionValues) => void;
}) => {
  return (
    Array.isArray(option.optionValues) &&
    option.optionValues.length > 1 && (
      <div className="mb-2">
        <h3 className="text-label">{option.name}:</h3>
        <ul className="flex items-center gap-2 flex-wrap">
          {option.optionValues.map((value) => (
            <li key={value.id}>
              <Button
                disabled={isOptionOutOfStock(option.name, value)}
                variant={
                  isOptionOutOfStock(option.name, value)
                    ? 'destructive'
                    : isOptionSelected?.(option.name, value)
                      ? 'default'
                      : 'outline'
                }
                type="button"
                size="sm"
                onClick={() => onClick(option?.id, option.name, value)}
              >
                {value.name}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    )
  );
};

export default Option;
