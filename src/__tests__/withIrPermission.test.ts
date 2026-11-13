import fs from 'fs';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withIrPermission = require('../../plugins/withIrPermission');

describe('withIrPermission config plugin & EAS APK config', () => {
  it('injects TRANSMIT_IR permission and optional consumerir hardware feature without duplicates', () => {
    const mockManifest = {
      manifest: {
        'uses-permission': [],
        'uses-feature': [],
      },
    };

    const resultOnce = withIrPermission.applyIrManifestEntries(mockManifest);
    const resultTwice = withIrPermission.applyIrManifestEntries(resultOnce);

    const permissions = resultTwice.manifest['uses-permission'];
    const features = resultTwice.manifest['uses-feature'];

    expect(
      permissions.filter(
        (entry: { $?: Record<string, string> }) =>
          entry.$?.['android:name'] === 'android.permission.TRANSMIT_IR'
      )
    ).toHaveLength(1);

    const irFeature = features.find(
      (entry: { $?: Record<string, string> }) =>
        entry.$?.['android:name'] === 'android.hardware.consumerir'
    );
    expect(irFeature).toBeDefined();
    expect(irFeature?.$?.['android:required']).toBe('false');
    expect(
      features.filter(
        (entry: { $?: Record<string, string> }) =>
          entry.$?.['android:name'] === 'android.hardware.consumerir'
      )
    ).toHaveLength(1);
  });

  it('registers plugin in app.json and configures preview APK build in eas.json', () => {
    const appJsonPath = path.resolve(__dirname, '../../app.json');
    const easJsonPath = path.resolve(__dirname, '../../eas.json');

    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    const easJson = JSON.parse(fs.readFileSync(easJsonPath, 'utf8'));

    expect(appJson.expo.plugins).toContain('./plugins/withIrPermission');
    expect(appJson.expo.android.package).toBe('com.tvremote.ir');
    expect(easJson.build.preview.android.buildType).toBe('apk');
  });
});

