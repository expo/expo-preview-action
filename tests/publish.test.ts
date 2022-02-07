import { findManifestUrl, findProjectPage } from '../src/publish';

describe('findProjectPageURL', () => {
  it('should find project page URL', () => {
    const expoPublishOutput = `
[15:22:15] › Expo SDK: 41.0.0
[15:22:15] › Release channel: pr-3
[15:22:15] › Workflow: Bare

[15:22:15] Building optimized bundles and generating sourcemaps...
[15:22:17] Starting Metro Bundler
[15:24:39] Finished building JavaScript bundle in 142513ms.
[15:24:39]
[15:24:39] Bundle                     Size
┌ index.ios.js          1.63 MB
├ index.android.js      1.64 MB
├ index.ios.js.map      4.61 MB
└ index.android.js.map  4.63 MB
[15:24:39]
[15:24:39] 💡 JavaScript bundle sizes affect startup time. Learn more: expo.fyi/javascript-bundle-sizes
[15:24:39]
[15:24:39] Analyzing assets
[15:24:39] Saving assets
[15:24:39] No assets changed, skipped.
[15:24:39]
Processing asset bundle patterns:
[15:24:39] - /home/runner/work/dev-client-gh-action/dev-client-gh-action/**/*
[15:24:39]
[15:24:39] Uploading JavaScript bundles
[15:24:41] Publish complete

[15:24:41] 📝  Manifest: https://exp.host/@lukaszkosmaty/tabs/index.exp?release-channel=pr-3&sdkVersion=41.0.0 Learn more: expo.fyi/manifest-url
[15:24:42] ⚙️   Project page: https://expo.dev/@markwas/here?release-channel=pr-3 Learn more: https://expo.fyi/project-page

`;
    const projectPageUrl = findProjectPage(expoPublishOutput);
    expect(projectPageUrl).toBe('https://expo.dev/@markwas/here?release-channel=pr-3');
  });

  it('should throw if cannot find project page URL', () => {
    expect(() => {
      const expoPublishOutput = 'nothing to see here...';
      findManifestUrl(expoPublishOutput);
    }).toThrow();
  });
});
describe('findManifestUrl', () => {
  it('should find manifest URL', () => {
    const expoPublishOutput = `
[15:22:15] › Expo SDK: 41.0.0
[15:22:15] › Release channel: pr-3
[15:22:15] › Workflow: Bare

[15:22:15] Building optimized bundles and generating sourcemaps...
[15:22:17] Starting Metro Bundler
[15:24:39] Finished building JavaScript bundle in 142513ms.
[15:24:39]
[15:24:39] Bundle                     Size
┌ index.ios.js          1.63 MB
├ index.android.js      1.64 MB
├ index.ios.js.map      4.61 MB
└ index.android.js.map  4.63 MB
[15:24:39]
[15:24:39] 💡 JavaScript bundle sizes affect startup time. Learn more: expo.fyi/javascript-bundle-sizes
[15:24:39]
[15:24:39] Analyzing assets
[15:24:39] Saving assets
[15:24:39] No assets changed, skipped.
[15:24:39]
Processing asset bundle patterns:
[15:24:39] - /home/runner/work/dev-client-gh-action/dev-client-gh-action/**/*
[15:24:39]
[15:24:39] Uploading JavaScript bundles
[15:24:41] Publish complete

[15:24:41] 📝  Manifest: https://exp.host/@lukaszkosmaty/tabs/index.exp?release-channel=pr-3&sdkVersion=41.0.0 Learn more: expo.fyi/manifest-url
`;
    const manifestURL = findManifestUrl(expoPublishOutput);

    expect(manifestURL).toBe('https://exp.host/@lukaszkosmaty/tabs/index.exp?release-channel=pr-3&sdkVersion=41.0.0');
  });

  it('should throw if cannot find manifest URL', () => {
    expect(() => {
      findManifestUrl('Missing manifest URL');
    }).toThrow();
  });
});
