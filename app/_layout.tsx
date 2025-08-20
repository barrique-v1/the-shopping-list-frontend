import { PaperProvider } from 'react-native-paper';
import TabLayout from './(tabs)/_layout';

export default function RootLayout() {
  return (
    <PaperProvider>
      <TabLayout />
    </PaperProvider>
  );
}
