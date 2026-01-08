'use client';

import { useState, useMemo, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShoppingCart, CheckCircle2, Link } from 'lucide-react';
import { addToCart } from '@/app/product/[slug]/actions';
import { toast } from 'sonner';
import { Price } from '@/components/commerce/price';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProductInfoProps {
    product: {
        id: string;
        name: string;
        description: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        customFields?: any;
        variants: Array<{
            id: string;
            name: string;
            sku: string;
            priceWithTax: number;
            stockLevel: string;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            customFields?: any;
            options: Array<{
                id: string;
                code: string;
                name: string;
                groupId: string;
                group: {
                    id: string;
                    code: string;
                    name: string;
                };
            }>;
        }>;
        optionGroups: Array<{
            id: string;
            code: string;
            name: string;
            options: Array<{
                id: string;
                code: string;
                name: string;
            }>;
        }>;
    };
    searchParams: { [key: string]: string | string[] | undefined };
}

const fieldLabels: Record<string, string> = {
    Brand: 'แบรนด์',
    PackingUnit: 'หน่วยบรรจุ',
    Width: 'ความกว้าง (mm)',
    Depth: 'ความลึก (mm)',
    Height: 'ความสูง (mm)',
    Weight: 'น้ำหนัก (g)',
};

export function ProductInfo({ product, searchParams }: ProductInfoProps) {
    const pathname = usePathname();
    const router = useRouter();
    const currentSearchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [isAdded, setIsAdded] = useState(false);

    // Initialize selected options from URL
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
        const initialOptions: Record<string, string> = {};

        // Load from URL search params
        product.optionGroups.forEach((group) => {
            const paramValue = searchParams[group.code];
            if (typeof paramValue === 'string') {
                // Find the option by code
                const option = group.options.find((opt) => opt.code === paramValue);
                if (option) {
                    initialOptions[group.id] = option.id;
                }
            }
        });

        return initialOptions;
    });

    // Find the matching variant based on selected options
    const selectedVariant = useMemo(() => {
        if (product.variants.length === 1) {
            return product.variants[0];
        }

        // If not all option groups have a selection, return null
        if (Object.keys(selectedOptions).length !== product.optionGroups.length) {
            return null;
        }

        // Find variant that matches all selected options
        return product.variants.find((variant) => {
            const variantOptionIds = variant.options.map((opt) => opt.id);
            const selectedOptionIds = Object.values(selectedOptions);
            return selectedOptionIds.every((optId) => variantOptionIds.includes(optId));
        });
    }, [selectedOptions, product.variants, product.optionGroups]);

    const handleOptionChange = (groupId: string, optionId: string) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [groupId]: optionId,
        }));

        // Find the option group and option to get their codes
        const group = product.optionGroups.find((g) => g.id === groupId);
        const option = group?.options.find((opt) => opt.id === optionId);

        if (group && option) {
            // Update URL with option code
            const params = new URLSearchParams(currentSearchParams);
            params.set(group.code, option.code);
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        }
    };

    const handleAddToCart = async () => {
        if (!selectedVariant) return;

        startTransition(async () => {
            const result = await addToCart(selectedVariant.id, 1);

            if (result.success) {
                setIsAdded(true);
                toast.success('Added to cart', {
                    description: `${product.name} has been added to your cart`,
                });

                // Reset the added state after 2 seconds
                setTimeout(() => setIsAdded(false), 2000);
            } else {
                toast.error('Error', {
                    description: result.error || 'Failed to add item to cart',
                });
            }
        });
    };

    const isInStock = selectedVariant && selectedVariant.stockLevel !== 'OUT_OF_STOCK';
    const canAddToCart = selectedVariant && isInStock;

    return (
        <div className="space-y-6">
            {/* Product Title */}
            <div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                {selectedVariant && (
                    <p className="text-2xl font-bold mt-2">
                        <Price value={selectedVariant.priceWithTax} />
                    </p>
                )}
            </div>

            {/* Product Description */}
            <div className="prose prose-m max-w-none">
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>

            {/* Option Groups */}
            {product.optionGroups.length > 0 && (
                <div className="space-y-4">
                    {product.optionGroups.map((group) => (
                        <div key={group.id} className="space-y-3">
                            <Label className="text-base font-semibold">
                                {group.name}
                            </Label>
                            <RadioGroup
                                value={selectedOptions[group.id] || ''}
                                onValueChange={(value) => handleOptionChange(group.id, value)}
                            >
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {group.options.map((option) => (
                                        <div key={option.id}>
                                            <RadioGroupItem
                                                value={option.id}
                                                id={option.id}
                                                className="peer sr-only"
                                            />
                                            <Label
                                                htmlFor={option.id}
                                                className="flex items-center justify-center rounded-md border-2 border-muted bg-popover px-4 py-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                                            >
                                                {option.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </RadioGroup>
                        </div>
                    ))}
                </div>
            )}

            {/* Stock Status
            {selectedVariant && (
                <div className="text-sm">
                    {isInStock ? (
                        <span className="text-green-600 font-medium">In Stock</span>
                    ) : (
                        <span className="text-destructive font-medium">Out of Stock</span>
                    )}
                </div>
            )} */}

            {/* Add to Cart Button
            <div className="pt-4">
                <Button
                    size="lg"
                    className="w-full"
                    disabled={!canAddToCart || isPending}
                    onClick={handleAddToCart}
                >
                    {isAdded ? (
                        <>
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Added to Cart
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            {isPending
                                ? 'Adding...'
                                : !selectedVariant && product.optionGroups.length > 0
                                    ? 'Select Options'
                                    : !isInStock
                                        ? 'Out of Stock'
                                        : 'Add to Cart'}
                        </>
                    )}
                </Button>
            </div> */}

            {/* SKU */}
            {selectedVariant && (
                <div className="text-m text-muted-foreground">
                    SKU: {selectedVariant.sku}
                    <br />
                    SupplierSKU: {selectedVariant.customFields?.SupplierSKU}
                    <br />
                    Barcode: {selectedVariant.customFields?.Barcode}
                </div>
            )}

            {/* Additional Info */}
            {/* Product Tabs */}
            {(selectedVariant?.customFields?.Additionalinfo || (product.customFields?.infoUrls && product.customFields.infoUrls.length > 0)) && (
                <div className="mt-8 pt-6 border-t">
                    <Tabs defaultValue="details" className="w-full">
                        <TabsList className="w-full justify-start">
                            {selectedVariant?.customFields?.Additionalinfo && (
                                <TabsTrigger value="details">ข้อมูลจำเพาะ</TabsTrigger>
                            )}
                            {product.customFields?.infoUrls && product.customFields.infoUrls.length > 0 && (
                                <TabsTrigger value="info-urls">ลิงก์เพิ่มเติม</TabsTrigger>
                            )}
                        </TabsList>

                        {/* Additional Info Tab Content */}
                        {selectedVariant?.customFields?.Additionalinfo && (
                            <TabsContent value="details" className="mt-4">
                                <div className="border rounded-md overflow-hidden">
                                    <table className="w-full text-sm">
                                        <tbody className="divide-y">
                                            {Object.entries(selectedVariant.customFields.Additionalinfo).map(([key, value]) => (
                                                value ? (
                                                    <tr key={key}>
                                                        <td className="px-4 py-3 font-medium text-muted-foreground w-1/3 bg-muted/30">{fieldLabels[key] || key}</td>
                                                        <td className="px-4 py-3">{value as React.ReactNode}</td>
                                                    </tr>
                                                ) : null
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>
                        )}

                        {/* Info URLs Tab Content */}
                        {product.customFields?.infoUrls && product.customFields.infoUrls.length > 0 && (
                            <TabsContent value="info-urls" className="mt-4">
                                <ul className="space-y-2">
                                    {product.customFields.infoUrls.map((url: string, index: number) => (
                                        <li key={index}>
                                            <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center text-sm text-blue-600 hover:underline"
                                            >
                                                <Link className="w-4 h-4 mr-2" />
                                                ข้อมูลจากซัพพลายเออร์
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </TabsContent>
                        )}
                    </Tabs>
                </div>
            )}
        </div>
    );
}
