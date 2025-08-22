// src/hooks/useDatabase.ts
import { useEffect, useState } from 'react';
import { useAppStore } from '@/stores';

export function useDatabase() {
    const { isDatabaseReady, initializeApp } = useAppStore();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                setIsLoading(true);
                await initializeApp();
            } catch (err) {
                setError(String(err));
            } finally {
                setIsLoading(false);
            }
        };

        if (!isDatabaseReady) {
            init();
        } else {
            setIsLoading(false);
        }
    }, [isDatabaseReady, initializeApp]);

    return {
        isReady: isDatabaseReady,
        isLoading,
        error,
    };
}
