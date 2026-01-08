'use client';

interface PriceProps {
    value: number;
    currencyCode?: string;
}

export function Price({ value, currencyCode = 'THB' }: PriceProps) {
    return (
        <>
            {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(value / 100)}
        </>
    );
}
