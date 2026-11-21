# IR TV Remote (Android)

Offline-first, bilingual (**Vietnamese / English**) Android IR TV Remote built with **Expo SDK 57**, a local **Kotlin `ConsumerIrManager` Expo Module**, TypeScript IR protocol encoders, and **Expo EAS Cloud APK Build** support.

## Features

- **Native Android IR Blaster (`modules/expo-ir-blaster`)**: Wraps Android `ConsumerIrManager` (`hasIrEmitter`, `getCarrierFrequencies`, `transmit`) using `expo-modules-core`.
- **Safe Simulation Fallback**: Uses `requireOptionalNativeModule('ExpoIrBlaster')` so the app runs cleanly in Expo Go or on phones without an IR emitter, switching automatically to **Simulation Mode** (`Chế độ giả lập` / `Simulation Mode`).
- **Offline 6-Brand IR Database (`src/services/ir/bundledCodesets.ts`)**: Includes >= 2 codeset variants with all 25 standard remote keys (15 control/navigation keys + `DIGIT_0`–`DIGIT_9`) for:
  - **Samsung** (`SAMSUNG32`)
  - **LG** (`NEC`)
  - **Sony** (`SONY_SIRC12`)
  - **TCL** (`NEC`)
  - **Casper** (`NEC`)
  - **Panasonic** (`NEC`)
- **In-Place Number Pad Toggle (`src/components/RemotePad.tsx`)**: Switch the central remote zone in-place between `D-Pad` navigation and a 3×4 `0–9` numeric keypad (`123`) on a single screen with shared `120ms` debounce and haptic feedback.
- **Quick Match Wizard (`app/wizard.tsx`)**: Pick a brand, test the Power key, cycle through codeset variants, name the room, and save.
- **Multi-Room Device Storage (`src/store/deviceStorage.ts`)**: Persist multiple TVs in `AsyncStorage`, switch the active room, rename devices, and delete with automatic active-device fallback.
- **Bilingual UI (`src/i18n/translations.ts`)**: Instant `VI | EN` header toggle persisted to `AsyncStorage`.

## Project Structure

```text
app/                      # Expo Router screens (_layout, tabs/index, tabs/devices, wizard)
modules/expo-ir-blaster/  # Local Kotlin Expo module + safe TypeScript wrapper
plugins/withIrPermission.js # Expo Config Plugin injecting TRANSMIT_IR & consumerir
src/
  components/RemotePad.tsx
  i18n/translations.ts
  services/ir/
    bundledCodesets.ts
    irTransmitter.ts
    protocolEncoder.ts
  store/deviceStorage.ts
  types/ir.ts
  __tests__/              # Jest unit tests
```

## Development & Verification

```bash
npm install
npm test          # Runs all 8 Jest suites (24 tests)
npm run typecheck # Runs tsc --noEmit
npx expo start    # Preview UI in Expo Go (Simulation Mode)
```

## Cloud APK Build (Expo EAS)

`eas.json` configures the `preview` profile with `"buildType": "apk"`, and `plugins/withIrPermission.js` injects `android.permission.TRANSMIT_IR` and `<uses-feature android:name="android.hardware.consumerir" android:required="false" />`.

```bash
npx eas-cli login
npm run build:apk
# or: npx eas-cli build -p android --profile preview
eas build --platform android --profile preview
```
