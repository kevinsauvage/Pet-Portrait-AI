type DebouncedFunction<T extends (...arguments_: unknown[]) => void> = {
  (this: ThisParameterType<T>, ...arguments_: Parameters<T>): void;
  cancel: () => void;
};

export default function debounce<T extends (...arguments_: unknown[]) => void>(
  function_: T,
  delay: number,
): DebouncedFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const debouncedFn = function (this: ThisParameterType<T>, ...arguments_: Parameters<T>) {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      function_.apply(this, arguments_);
    }, delay);
  } as DebouncedFunction<T>;

  debouncedFn.cancel = () => {
    clearTimeout(timeoutId);
    timeoutId = undefined;
  };

  return debouncedFn;
}
