export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { assertProductionEmailEnv, logRuntimeConfigRecommendations } = await import(
    '@/core/config/runtime-warnings'
  );

  assertProductionEmailEnv();
  logRuntimeConfigRecommendations();
}
