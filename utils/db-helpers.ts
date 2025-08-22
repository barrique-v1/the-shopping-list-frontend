// src/utils/db-helpers.ts
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { importExportService } from '@/services';

export class DatabaseHelpers {
    /**
     * Export database to a JSON file
     */
    static async exportToFile(): Promise<void> {
        try {
            const data = await importExportService.exportAllData();
            const json = importExportService.exportToJSON(data);

            const fileName = `shopping-list-backup-${new Date().toISOString().split('T')[0]}.json`;
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;

            await FileSystem.writeAsStringAsync(fileUri, json, {
                encoding: FileSystem.EncodingType.UTF8,
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                throw new Error('Sharing is not available on this device');
            }
        } catch (error) {
            throw new Error(`Export failed: ${error}`);
        }
    }

    /**
     * Import database from a JSON file
     */
    static async importFromFile(): Promise<{
        success: boolean;
        message: string;
    }> {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
            });

            if (result.type === 'cancel') {
                return { success: false, message: 'Import cancelled' };
            }

            const content = await FileSystem.readAsStringAsync(result.uri, {
                encoding: FileSystem.EncodingType.UTF8,
            });

            const data = importExportService.parseImportJSON(content);
            const importResult = await importExportService.importData(data);

            if (importResult.errors.length > 0) {
                return {
                    success: false,
                    message: `Import completed with errors: ${importResult.errors.join(', ')}`,
                };
            }

            return {
                success: true,
                message: `Successfully imported ${importResult.listsImported} lists and ${importResult.recipesImported} recipes`,
            };
        } catch (error) {
            return {
                success: false,
                message: `Import failed: ${error}`,
            };
        }
    }

    /**
     * Get database file size
     */
    static async getDatabaseSize(): Promise<number> {
        try {
            const dbPath = `${FileSystem.documentDirectory}SQLite/shopping.db`;
            const info = await FileSystem.getInfoAsync(dbPath);

            if (info.exists && 'size' in info) {
                return info.size;
            }

            return 0;
        } catch (error) {
            console.error('Failed to get database size:', error);
            return 0;
        }
    }

    /**
     * Format bytes to human readable size
     */
    static formatBytes(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}
