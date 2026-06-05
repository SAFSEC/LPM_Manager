/** @type {import('electron-builder').Configuration} */
export default {
  appId: 'de.jwsafety.lpm-manager',
  productName: 'LPM Manager',
  copyright: 'Copyright © JW Safety & Security',
  directories: {
    output: 'release',
    buildResources: 'assets',
  },
  files: ['out/**/*', 'package.json'],
  mac: {
    category: 'public.app-category.business',
    target: ['dmg'],
    icon: 'assets/icons/icon.icns',
  },
  win: {
    target: ['nsis'],
    icon: 'assets/icons/icon.ico',
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
  },
};
