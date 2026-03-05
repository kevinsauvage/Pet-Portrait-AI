/**
 * RouteGradient - Subtle vertical gradient for the main layout
 * Soft fade from top (primary tint) to bottom (transparent), full width
 */
const RouteGradient = () => {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    >
      <div
        className="absolute inset-x-0 top-0 h-[50vh] w-full bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--primary)_6%,transparent)_0%,transparent_100%)]"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

export default RouteGradient;
