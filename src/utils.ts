export const leftPadding = (value: number, padLength: number, character: string) => {
    let characters = '';

    if (String(value).length > padLength) {
        return value;
    }

    for (let i = 0; i < padLength; i = i + 1) {
        characters += character;
    }

    return `${characters}${value}`.slice(-characters.length);
};

export const calculateIntegerUnitQuotient = (unit = 0, divisor: number) => {
    const quotient = unit / divisor;
    return quotient < 0 ? Math.ceil(quotient) : Math.floor(quotient);
};

export const mod = (number: number, module: number) => ((number % module) + module) % module;
