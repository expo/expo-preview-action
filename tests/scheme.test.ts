// eslint-disable-next-line @typescript-eslint/no-empty-function
const core = { info: () => {} };
const Android = { getAsync: jest.fn() };
const Ios = { getAsync: jest.fn() };
const fsExtra = { pathExists: () => Promise.resolve(true) };

jest.mock('uri-scheme', () => ({
	Android,
	Ios,
}));
jest.mock('@actions/core', () => core);
jest.mock('fs-extra', () => fsExtra);

import { ProjectFlavor } from '../src/config';
import { chooseScheme } from '../src/scheme';

describe('chooseScheme', () => {
	it('should prefer scheme from config', async () => {
		const scheme = await chooseScheme({
			projectFlavor: ProjectFlavor.DevelopmentClient,
			scheme: 'scheme-from-config',
		});

		expect(scheme).toBe('scheme-from-config');
	});

	describe('try to discover schemes', () => {
		it('should select common scheme', async () => {
			const commonScheme = 'common-scheme';
			Android.getAsync.mockResolvedValue([commonScheme]);
			Ios.getAsync.mockResolvedValue([commonScheme]);
			const scheme = await chooseScheme({
				projectFlavor: ProjectFlavor.DevelopmentClient,
			});

			expect(scheme).toBe(commonScheme);
		});

		it('should fallback to "exp" scheme', async () => {
			Android.getAsync.mockResolvedValue(['android-scheme']);
			Ios.getAsync.mockResolvedValue(['ios-scheme']);
			const scheme = await chooseScheme({
				projectFlavor: ProjectFlavor.DevelopmentClient,
			});

			expect(scheme).toBe('exp');
		});

		it('should respect project root option', async () => {
			const projectRoot = '/android/project/root/';
			await chooseScheme({
				projectFlavor: ProjectFlavor.DevelopmentClient,
				projectRoot,
			});

			expect(Android.getAsync.mock.calls.length).toBe(1);
			expect(Android.getAsync.mock.calls[0][0]).toMatchObject({ projectRoot });
			expect(Ios.getAsync.mock.calls.length).toBe(1);
			expect(Ios.getAsync.mock.calls[0][0]).toMatchObject({ projectRoot });
		});

		it('should use default project root', async () => {
			await chooseScheme({
				projectFlavor: ProjectFlavor.DevelopmentClient,
			});

			expect(Android.getAsync.mock.calls.length).toBe(1);
			expect(Android.getAsync.mock.calls[0][0]).toMatchObject({ projectRoot: '.' });
			expect(Ios.getAsync.mock.calls.length).toBe(1);
			expect(Ios.getAsync.mock.calls[0][0]).toMatchObject({ projectRoot: '.' });
		});

		it('should respect manifest & info plist path', async () => {
			const manifestPath = '/android/project/root/AndroidManifest.xml';
			const infoPlist = '/ios/project/root/Info.plist';
			await chooseScheme({
				projectFlavor: ProjectFlavor.DevelopmentClient,
				manifestPath,
				infoPlist,
			});

			expect(Android.getAsync.mock.calls.length).toBe(1);
			expect(Android.getAsync.mock.calls[0][0]).toMatchObject({ manifestPath, projectRoot: '.' });
			expect(Ios.getAsync.mock.calls.length).toBe(1);
			expect(Ios.getAsync.mock.calls[0][0]).toMatchObject({ infoPath: infoPlist, projectRoot: '.' });
		});
	});
});
