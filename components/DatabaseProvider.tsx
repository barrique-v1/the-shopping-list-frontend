// src/components/DatabaseProvider.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useDatabase } from '@/hooks/useDatabase';

interface DatabaseProviderProps {
    children: React.ReactNode;
    loadingComponent?: React.ReactNode;
    errorComponent?: (error: string) => React.ReactNode;
}

export function DatabaseProvider({
    children,
    loadingComponent,
    errorComponent,
}: DatabaseProviderProps) {
    const { isReady, isLoading, error } = useDatabase();

    if (isLoading) {
        return (
            loadingComponent || (
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <ActivityIndicator size="large" />
                    <Text style={{ marginTop: 10 }}>
                        Initializing database...
                    </Text>
                </View>
            )
        );
    }

    if (error) {
        return (
            errorComponent?.(error) || (
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Text>Database Error: {error}</Text>
                </View>
            )
        );
    }

    if (!isReady) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Text>Database not ready</Text>
            </View>
        );
    }

    return <>{children}</>;
}
