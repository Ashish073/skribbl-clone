export const generateNumberOptions = (minValue, maxValue, multipliers = 1) => {
    if (typeof maxValue !== 'number' || maxValue < 2) {
        throw new Error('Invalid input.');
    }

    return Array.from(Array(maxValue - minValue + 1).keys(), n => ({
        label: `${(n + minValue) * multipliers}`,
        value: Number((n + minValue) * multipliers)
    }));
}