import { StatusBar } from 'expo-status-bar';
import { NativeBaseProvider } from 'native-base';
import { AppRoot } from './src/application/AppRoot';
import { appTheme } from './src/theme/appTheme';

export default function App() {
  return (
    <NativeBaseProvider theme={appTheme}>
      <StatusBar style="dark" />
      <AppRoot />
    </NativeBaseProvider>
  );
}
