export interface ShoppingList {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    totalItems: number;
    completedItems: number;
}