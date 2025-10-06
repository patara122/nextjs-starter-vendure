import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
    product: {
        productId: string;
        productName: string;
        slug: string;
        productAsset?: {
            id: string;
            preview: string;
        };
        priceWithTax: {
            min?: number;
            max?: number;
            value?: number;
        };
        currencyCode: string;
    };
}

function formatPrice(price: number, currencyCode: string) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
    }).format(price / 100);
}

export function ProductCard({ product }: ProductCardProps) {
    const price = product.priceWithTax.value || product.priceWithTax.min || 0;
    const hasRange = product.priceWithTax.min !== undefined &&
                     product.priceWithTax.max !== undefined &&
                     product.priceWithTax.min !== product.priceWithTax.max;

    return (
        <Link
            href={`/product/${product.slug}`}
            className="group block bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow"
        >
            <div className="aspect-square relative bg-muted">
                {product.productAsset ? (
                    <Image
                        src={product.productAsset.preview}
                        alt={product.productName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No image
                    </div>
                )}
            </div>
            <div className="p-4 space-y-2">
                <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {product.productName}
                </h3>
                <p className="text-lg font-bold">
                    {hasRange ? (
                        <>
                            {formatPrice(product.priceWithTax.min!, product.currencyCode)} - {formatPrice(product.priceWithTax.max!, product.currencyCode)}
                        </>
                    ) : (
                        formatPrice(price, product.currencyCode)
                    )}
                </p>
            </div>
        </Link>
    );
}
