// hooks/useAppInitialization.ts
import { useEffect, useState } from 'react';
import database from '@/database/database';

export function useAppInitialization() {
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                // Initialize database
                await database.init();
                console.log('Database initialized successfully');

                setIsInitialized(true);
            } catch (err) {
                console.error('Failed to initialize app:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            }
        };

        initializeApp();
    }, []);

    return { isInitialized, error };
}

// Usage in app/_layout.tsx:
/*
import { useAppInitialization } from '@/hooks/useAppInitialization';

export default function RootLayout() {
  const { isInitialized, error } = useAppInitialization();

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {error ? (
          <Text>Error: {error}</Text>
        ) : (
          <ActivityIndicator size="large" />
        )}
      </View>
    );
  }

  // Rest of your app layout...
}
*/
