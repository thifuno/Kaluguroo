// Dynamic Expo config. All static settings live in app.json.
//
// GitHub Actions sets GITHUB_REPOSITORY (for example "thifuno/Kaluguroo").
// A project page is served from /<repository>/, so the web build needs that
// base path. Local builds keep the default root path.
const repository = process.env.GITHUB_REPOSITORY;
const repositoryName = repository ? repository.split('/')[1] : undefined;

const envBaseUrl = process.env.EXPO_BASE_URL?.trim();
const baseUrl = envBaseUrl || (repositoryName ? `/${repositoryName}` : undefined);

/** @type {(input: { config: import('expo/config').ExpoConfig }) => import('expo/config').ExpoConfig} */
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(baseUrl ? { baseUrl } : null),
  },
});
