
import { Camera } from "lucide-react";
import type { HomeSectionProps } from "./types";

export default function Gallery({ settings }: HomeSectionProps) {
    const { featured, items } = settings.gallery;
    const galleryItems = items.filter((item) => item.image.trim());

    return (
        <section
            id="gallery"
            className="bg-background px-4 py-8 text-foreground sm:px-6 sm:py-12"
        >

            
            <div className="mx-auto max-w-6xl">
                {/* Heading */}
                <div className="mb-5 text-center sm:mb-6">
                    
                    <p className="font-serif text-2xl italic text-primary  font-semibold tracking-[0.35em] uppercase">
                    Gallery
                        </p>

                    <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Our Moments
                    </h2>

                    <p className="mt-2 font-serif text-sm italic text-muted-foreground sm:text-base">
                        Moments captured, love remembered
                    </p>

                    <div className="mt-4 flex items-center justify-center gap-3">
                        <span className="h-px w-14 bg-primary" />
                        <Camera
                            aria-hidden="true"
                            className="size-4 text-primary"
                            strokeWidth={2.5}
                        />
                        <span className="h-px w-14 bg-primary" />
                    </div>
                </div>

                {/* Featured Bride & Bridegroom */}
                {featured.image.trim() && (
                    <article className="group mx-auto mb-3 max-w-5xl overflow-hidden rounded-2xl bg-card shadow-md transition duration-300 hover:shadow-xl sm:mb-4">
                        <div className="relative h-[280px] overflow-hidden bg-muted sm:h-[380px] lg:h-[460px]">
                            <img
                                src={featured.image}
                                alt={featured.alt}
                                loading="lazy"
                                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                            />

                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-5 pb-5 pt-16 sm:px-8 sm:pb-8">
                                <p className="font-serif text-2xl font-bold text-white sm:text-3xl">
                                    {featured.name}
                                </p>
                                <p className="mt-1 text-sm text-white/85">
                                    Together is a beautiful place to be
                                </p>
                            </div>
                        </div>
                    </article>
                )}

                {/* Supporting photo cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                    {galleryItems.map((item) => (
                        <article
                            key={`${item.image}-${item.name}-${item.alt}`}
                            className="group overflow-hidden rounded-xl bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="aspect-[3/3.5] overflow-hidden bg-muted">
                                <img
                                    src={item.image}
                                    alt={item.alt}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            <div className="px-2 py-3 text-center sm:px-3">
                                <h3 className="text-xs font-bold text-foreground sm:text-sm">
                                    {item.name}
                                </h3>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}