import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'CamCapture',
  webDir: 'www',
  "plugins": {
    "Camera": {
      "ios": {
        "photoLibraryUsageDescription": "Este aplicativo requer acesso à biblioteca de fotos para salvar imagens."
      },
      "android": {
        "photosPermission": {
          "description": "Este aplicativo requer acesso à biblioteca de fotos para salvar imagens."
        }
      }
    }
  },

  server: {
    androidScheme: 'https'
  }
};

export default config;
