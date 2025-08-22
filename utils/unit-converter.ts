// src/utils/unit-converter.ts
import { Unit } from '@/types/constants';

interface UnitConversion {
    from: Unit;
    to: Unit;
    factor: number;
}

const conversions: UnitConversion[] = [
    // Weight conversions
    { from: Unit.GRAM, to: Unit.KILOGRAM, factor: 0.001 },
    { from: Unit.KILOGRAM, to: Unit.GRAM, factor: 1000 },
    { from: Unit.POUND, to: Unit.KILOGRAM, factor: 0.453592 },
    { from: Unit.KILOGRAM, to: Unit.POUND, factor: 2.20462 },
    { from: Unit.OUNCE, to: Unit.GRAM, factor: 28.3495 },
    { from: Unit.GRAM, to: Unit.OUNCE, factor: 0.035274 },

    // Volume conversions
    { from: Unit.MILLILITER, to: Unit.LITER, factor: 0.001 },
    { from: Unit.LITER, to: Unit.MILLILITER, factor: 1000 },
    { from: Unit.CUP, to: Unit.MILLILITER, factor: 236.588 },
    { from: Unit.TABLESPOON, to: Unit.MILLILITER, factor: 14.7868 },
    { from: Unit.TEASPOON, to: Unit.MILLILITER, factor: 4.92892 },
];

export class UnitConverter {
    static convert(value: number, from: Unit, to: Unit): number | null {
        if (from === to) return value;

        // Direct conversion
        const directConversion = conversions.find(
            c => c.from === from && c.to === to
        );
        if (directConversion) {
            return value * directConversion.factor;
        }

        // Try indirect conversion (via intermediate unit)
        for (const conv1 of conversions) {
            if (conv1.from === from) {
                const conv2 = conversions.find(
                    c => c.from === conv1.to && c.to === to
                );
                if (conv2) {
                    return value * conv1.factor * conv2.factor;
                }
            }
        }

        return null; // No conversion available
    }

    static getCompatibleUnits(unit: Unit): Unit[] {
        const compatible: Set<Unit> = new Set([unit]);

        // Find all units that can be converted to/from
        conversions.forEach(conv => {
            if (conv.from === unit) compatible.add(conv.to);
            if (conv.to === unit) compatible.add(conv.from);
        });

        // Find indirect conversions
        const compatibleArray = Array.from(compatible);
        compatibleArray.forEach(u => {
            conversions.forEach(conv => {
                if (conv.from === u) compatible.add(conv.to);
                if (conv.to === u) compatible.add(conv.from);
            });
        });

        return Array.from(compatible);
    }

    static isWeightUnit(unit: Unit): boolean {
        return [Unit.GRAM, Unit.KILOGRAM, Unit.POUND, Unit.OUNCE].includes(unit);
    }

    static isVolumeUnit(unit: Unit): boolean {
        return [
            Unit.MILLILITER,
            Unit.LITER,
            Unit.CUP,
            Unit.TABLESPOON,
            Unit.TEASPOON,
            Unit.FLUID_OUNCE
        ].includes(unit);
    }

    static isCountUnit(unit: Unit): boolean {
        return [
            Unit.PIECE,
            Unit.PACK,
            Unit.BOTTLE,
            Unit.CAN,
            Unit.BAG,
            Unit.BOX,
            Unit.BUNCH,
            Unit.SLICE,
            Unit.PINCH,
            Unit.HANDFUL
        ].includes(unit);
    }
}