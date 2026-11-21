const { withAndroidManifest } = require('expo/config-plugins');

const IR_PERMISSION = 'android.permission.TRANSMIT_IR';
const IR_FEATURE = 'android.hardware.consumerir';

function applyIrManifestEntries(androidManifest) {
  const manifest = androidManifest.manifest || {};
  manifest['uses-permission'] = manifest['uses-permission'] || [];
  manifest['uses-feature'] = manifest['uses-feature'] || [];

  const hasPermission = manifest['uses-permission'].some(
    (item) => item.$ && item.$['android:name'] === IR_PERMISSION
  );
  if (!hasPermission) {
    manifest['uses-permission'].push({
      $: { 'android:name': IR_PERMISSION },
    });
  }

  const existingFeature = manifest['uses-feature'].find(
    (item) => item.$ && item.$['android:name'] === IR_FEATURE
  );
  if (existingFeature) {
    existingFeature.$['android:required'] = 'false';
  } else {
    manifest['uses-feature'].push({
      $: {
        'android:name': IR_FEATURE,
        'android:required': 'false',
      },
    });
  }

  androidManifest.manifest = manifest;
  return androidManifest;
}

function withIrPermission(config) {
  return withAndroidManifest(config, (configWithManifest) => {
    configWithManifest.modResults = applyIrManifestEntries(configWithManifest.modResults);
    return configWithManifest;
  });
}

withIrPermission.applyIrManifestEntries = applyIrManifestEntries;
module.exports = withIrPermission;
