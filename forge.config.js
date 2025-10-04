module.exports = {
  packagerConfig: {
    /*
     * TEMPORARY: Disable asar completely to verify sharp native module loads inside packaged app.
     * If this fixes the issue, we'll re‑enable asar with a minimal unpack rule, e.g.:
     *   asar: { unpackDir: 'node_modules/sharp' }
     * or
     *   asar: { unpack: 'node_modules/sharp/**' }
     * The previous pattern using brace expansion may not have matched as expected on Windows.
     */
    asar: false,
    icon: './build/icon', // expects build/icon.ico for Windows
    name: 'grumpy-image',
    executableName: 'grumpy-image',
    appBundleId: 'com.daniel-schidlowski.grumpy-image',
    appCategoryType: 'public.app-category.graphics-design',
    win32metadata: {
      CompanyName: 'Daniel Schidlowski',
      ProductName: 'Grumpy Image'
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'grumpy-image',
        setupExe: 'GrumpyImageSetup.exe',
        setupIcon: './build/icon.ico'
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32']
    }
  ],
  plugins: []
};