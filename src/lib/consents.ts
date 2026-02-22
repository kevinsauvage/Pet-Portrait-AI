export type originalSettingsType = {
  ad_storage: boolean;
  analytics_storage: boolean;
  functionality_storage: boolean;
  personalization_storage: boolean;
};

type transformedSettingsType = {
  ad_storage: 'granted' | 'denied';
  analytics_storage: 'granted' | 'denied';
  functionality_storage: 'granted' | 'denied';
  personalization_storage: 'granted' | 'denied';
};

export const transformedSettings = (originalObject: originalSettingsType) => {
  const transformedObject = {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
  } as transformedSettingsType;

  Object.keys(originalObject).forEach((key) => {
    transformedObject[key as keyof transformedSettingsType] = originalObject[
      key as keyof originalSettingsType
    ]
      ? 'granted'
      : 'denied';
  });

  return transformedObject;
};
