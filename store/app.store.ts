// src/stores/app.store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dbClient } from '@/database/client';
import { importExportService } from '@/services';

interface AppState {
    // App State
    isInitialized: boolean;
    isDatabaseReady: boolean;
    appVersion: string;
    lastSyncAt: string | null;

    // Settings
    theme: 'light' | 'dark' | 'system';
    language: 'de' | 'en';
    defaultListView: 'grid' | 'list';
    showCompletedItems: boolean;
    autoDeleteCompleted: boolean;
    autoDeleteDays: number;

    // Actions
    initializeApp: () => Promise<void>;
    resetApp: () => Promise<void>;

    // Import/Export
    exportData: () => Promise<string>;
    importData: (
        jsonData: string
    ) => Promise<{ success: boolean; message: string }>;

    // Settings Actions
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    setLanguage: (language: 'de' | 'en') => void;
    setDefaultListView: (view: 'grid' | 'list') => void;
    setShowCompletedItems: (show: boolean) => void;
    setAutoDeleteCompleted: (enabled: boolean) => void;
    setAutoDeleteDays: (days: number) => void;
}

export const useAppStore = create<AppState>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                isInitialized: false,
                isDatabaseReady: false,
                appVersion: '1.0.0',
                lastSyncAt: null,

                // Default settings
                theme: 'system',
                language: 'de',
                defaultListView: 'grid',
                showCompletedItems: true,
                autoDeleteCompleted: false,
                autoDeleteDays: 7,

                // Actions
                initializeApp: async () => {
                    try {
                        // Initialize database
                        await dbClient.getDatabase();

                        set({
                            isInitialized: true,
                            isDatabaseReady: true,
                        });
                    } catch (error) {
                        console.error('Failed to initialize app:', error);
                        set({
                            isInitialized: true,
                            isDatabaseReady: false,
                        });
                    }
                },

                resetApp: async () => {
                    try {
                        // Clear all AsyncStorage
                        await AsyncStorage.clear();

                        // Close database connection
                        await dbClient.close();

                        // Reset state
                        set({
                            isInitialized: false,
                            isDatabaseReady: false,
                            lastSyncAt: null,
                            theme: 'system',
                            language: 'de',
                            defaultListView: 'grid',
                            showCompletedItems: true,
                            autoDeleteCompleted: false,
                            autoDeleteDays: 7,
                        });

                        // Re-initialize
                        await get().initializeApp();
                    } catch (error) {
                        console.error('Failed to reset app:', error);
                    }
                },

                // Import/Export
                exportData: async () => {
                    try {
                        const data = await importExportService.exportAllData();
                        return importExportService.exportToJSON(data);
                    } catch (error) {
                        throw new Error(`Export failed: ${error}`);
                    }
                },

                importData: async (jsonData: string) => {
                    try {
                        const data =
                            importExportService.parseImportJSON(jsonData);
                        const result =
                            await importExportService.importData(data);

                        if (result.errors.length > 0) {
                            return {
                                success: false,
                                message: `Import completed with errors: ${result.errors.join(', ')}`,
                            };
                        }

                        return {
                            success: true,
                            message: `Successfully imported ${result.listsImported} lists and ${result.recipesImported} recipes`,
                        };
                    } catch (error) {
                        return {
                            success: false,
                            message: `Import failed: ${error}`,
                        };
                    }
                },

                // Settings Actions
                setTheme: (theme) => set({ theme }),
                setLanguage: (language) => set({ language }),
                setDefaultListView: (view) => set({ defaultListView: view }),
                setShowCompletedItems: (show) =>
                    set({ showCompletedItems: show }),
                setAutoDeleteCompleted: (enabled) =>
                    set({ autoDeleteCompleted: enabled }),
                setAutoDeleteDays: (days) => set({ autoDeleteDays: days }),
            }),
            {
                name: 'app-storage',
                storage: {
                    getItem: async (name) => {
                        const value = await AsyncStorage.getItem(name);
                        return value ? JSON.parse(value) : null;
                    },
                    setItem: async (name, value) => {
                        await AsyncStorage.setItem(name, JSON.stringify(value));
                    },
                    removeItem: async (name) => {
                        await AsyncStorage.removeItem(name);
                    },
                },
            }
        ),
        {
            name: 'app-store',
        }
    )
);
