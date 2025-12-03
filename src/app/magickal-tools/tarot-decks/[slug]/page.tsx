"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { tarotProducts } from '@/lib/marketplaceData';
import ImageSlider from '@/app/components/ImageSlider';
import MagickalBackLink from '@/app/components/MagickalBackLink';

export default function TarotProductPage() {
    const params = useParams();
    const slug = params.slug as string;

    const product = tarotProducts.find(p => p.slug === slug);

    const [quantity, setQuantity] = useState(1);
    const [selectedEdition, setSelectedEdition] = useState(product?.editions[0].id || '');

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
                <MagickalBackLink href="/magickal-tools/tarot-decks" text="Return to Decks" />
                <h1 className="text-4xl mt-8">Deck Not Found</h1>
                <p>The spirits could not locate this tome.</p>
            </div>
        );
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleAddToCart = () => {
        console.log({
            productId: product.id,
            editionId: selectedEdition,
            quantity: quantity,
        });
        const win = (globalThis as any).window;
        if (win) {
            win.alert(`${quantity} x ${product.name} (${selectedEdition}) added to cart! (Placeholder)`);
        }
    };

    const selectedEditionDetails = product.editions.find(e => e.id === selectedEdition);
    const currentPrice = product.price + (selectedEditionDetails?.priceModifier || 0);

    return (
        <main className="relative min-h-screen w-full bg-black bg-cover bg-center p-8" style={{ backgroundImage: "url('/images/grand-hall-bg.png')" }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            
            {/* UPDATED BACK LINK */}
            <MagickalBackLink 
                href="/magickal-tools/tarot-decks"
                text="Back to Decks"
                className="absolute top-6 left-6 z-20"
            />

            <div className="relative z-10 max-w-6xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 text-white">
                <div className="w-full max-w-md mx-auto md:max-w-none">
                    <ImageSlider images={product.sliderImages} />
                </div>

                <div className="flex flex-col">
                    <h1 className="text-4xl lg:text-5xl font-bold font-serif text-amber-300">{product.name}</h1>
                    <h2 className="text-2xl text-green-400 mb-4">{product.tagline}</h2>
                    <p className="text-2xl font-semibold mb-4">${currentPrice.toFixed(2)}</p>
                    <p className="text-lg italic text-gray-300 mb-6">{product.intro}</p>
                    <p className="text-gray-400 leading-relaxed">{product.description}</p>
                    
                    <div className="mt-8 space-y-6">
                        <div>
                            <label htmlFor="edition" className="block text-sm font-medium text-gray-300 mb-2">Edition</label>
                            <select
                                id="edition"
                                value={selectedEdition}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onChange={(e) => setSelectedEdition((e.target as any).value)}
                                className="w-full bg-black/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-amber-400"
                            >
                                {product.editions.map(edition => (
                                    <option key={edition.id} value={edition.id} className="bg-gray-800">
                                        {edition.name} (+${edition.priceModifier.toFixed(2)})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-4">
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-300">Quantity</label>
                            <input
                                type="number"
                                id="quantity"
                                value={quantity}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onChange={(e) => setQuantity(Math.max(1, parseInt((e.target as any).value, 10)))}
                                min="1"
                                className="w-20 bg-black/50 border border-gray-600 rounded-lg px-3 py-2 text-white text-center"
                            />
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-green-700 hover:bg-green-600 text-white font-bold text-lg py-4 px-6 rounded-lg transition-colors"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}