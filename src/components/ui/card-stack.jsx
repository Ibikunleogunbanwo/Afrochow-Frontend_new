"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { SquareArrowOutUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}

function wrapIndex(n, len) {
    if (len <= 0) return 0;
    return ((n % len) + len) % len;
}

function signedOffset(i, active, len, loop) {
    const raw = i - active;
    if (!loop || len <= 1) return raw;
    const alt = raw > 0 ? raw - len : raw + len;
    return Math.abs(alt) < Math.abs(raw) ? alt : raw;
}

export function CardStack({
                              items,
                              initialIndex = 0,
                              maxVisible = 7,
                              cardWidth = 520,
                              cardHeight = 320,
                              overlap = 0.48,
                              spreadDeg = 48,
                              perspectivePx = 1100,
                              depthPx = 140,
                              tiltXDeg = 12,
                              activeLiftPx = 22,
                              activeScale = 1.03,
                              inactiveScale = 0.94,
                              springStiffness = 280,
                              springDamping = 28,
                              loop = true,
                              autoAdvance = false,
                              intervalMs = 2800,
                              pauseOnHover = true,
                              showDots = true,
                              showArrows = true,
                              className,
                              onChangeIndex,
                              renderCard,
                          }) {
    const reduceMotion = useReducedMotion();
    const len = items.length;

    const [active, setActive] = React.useState(() => wrapIndex(initialIndex, len));
    const [hovering, setHovering] = React.useState(false);

    React.useEffect(() => {
        setActive((a) => wrapIndex(a, len));
    }, [len]);

    React.useEffect(() => {
        if (!len) return;
        onChangeIndex?.(active, items[active]);
    }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

    const maxOffset = Math.max(0, Math.floor(maxVisible / 2));
    const cardSpacing = Math.max(10, Math.round(cardWidth * (1 - overlap)));
    const stepDeg = maxOffset > 0 ? spreadDeg / maxOffset : 0;

    const canGoPrev = loop || active > 0;
    const canGoNext = loop || active < len - 1;

    const prev = React.useCallback(() => {
        if (!len || !canGoPrev) return;
        setActive((a) => wrapIndex(a - 1, len));
    }, [canGoPrev, len]);

    const next = React.useCallback(() => {
        if (!len || !canGoNext) return;
        setActive((a) => wrapIndex(a + 1, len));
    }, [canGoNext, len]);

    const onKeyDown = (e) => {
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
    };

    React.useEffect(() => {
        if (!autoAdvance || reduceMotion || !len) return;
        if (pauseOnHover && hovering) return;

        const id = window.setInterval(() => {
            if (loop || active < len - 1) next();
        }, Math.max(700, intervalMs));

        return () => window.clearInterval(id);
    }, [autoAdvance, intervalMs, hovering, pauseOnHover, reduceMotion, len, loop, active, next]);

    if (!len) return null;

    const activeItem = items[active];

    return (
        <div
            className={cn("w-full", className)}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
        >
            {/* Stage + Arrows */}
            <div className="relative flex items-center justify-center gap-2 sm:gap-4">

                {/* Left Arrow */}
                {showArrows && (
                    <button
                        onClick={prev}
                        disabled={!canGoPrev}
                        className="shrink-0 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 hover:bg-orange-50 hover:border-orange-300 hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 group"
                        aria-label="Previous category"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-orange-600 transition-colors" />
                    </button>
                )}

                {/* Stage */}
                <div
                    className="relative flex-1"
                    style={{ height: Math.max(380, cardHeight + 80) }}
                    tabIndex={0}
                    onKeyDown={onKeyDown}
                >
                    <div className="pointer-events-none absolute inset-x-0 top-6 mx-auto h-48 w-[70%] rounded-full bg-black/5 blur-3xl" aria-hidden="true" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-40 w-[76%] rounded-full bg-black/10 blur-3xl" aria-hidden="true" />

                    <div
                        className="absolute inset-0 flex items-end justify-center"
                        style={{ perspective: `${perspectivePx}px` }}
                    >
                        <AnimatePresence initial={false}>
                            {items.map((item, i) => {
                                const off = signedOffset(i, active, len, loop);
                                const abs = Math.abs(off);
                                const visible = abs <= maxOffset;
                                if (!visible) return null;

                                const rotateZ = off * stepDeg;
                                const x = off * cardSpacing;
                                const y = abs * 10;
                                const z = -abs * depthPx;
                                const isActive = off === 0;
                                const scale = isActive ? activeScale : inactiveScale;
                                const lift = isActive ? -activeLiftPx : 0;
                                const rotateX = isActive ? 0 : tiltXDeg;
                                const zIndex = 100 - abs;

                                return (
                                    <motion.div
                                        key={item.id}
                                        className={cn(
                                            "absolute bottom-0 rounded-2xl border-4 border-black/10 overflow-hidden shadow-xl will-change-transform select-none",
                                            isActive ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
                                        )}
                                        style={{
                                            width: cardWidth,
                                            height: cardHeight,
                                            zIndex,
                                            transformStyle: "preserve-3d",
                                        }}
                                        initial={reduceMotion ? false : { opacity: 0, y: y + 40, x, rotateZ, rotateX, scale }}
                                        animate={{ opacity: 1, x, y: y + lift, rotateZ, rotateX, scale }}
                                        transition={{ type: "spring", stiffness: springStiffness, damping: springDamping }}
                                        onClick={() => !isActive && setActive(i)}
                                        // ✅ drag handled separately only on active card
                                        drag={isActive ? "x" : false}
                                        dragConstraints={isActive ? { left: 0, right: 0 } : undefined}
                                        dragElastic={isActive ? 0.18 : undefined}
                                        onDragEnd={isActive ? (_e, info) => {
                                            if (reduceMotion) return;
                                            const travel = info.offset.x;
                                            const v = info.velocity.x;
                                            const threshold = Math.min(160, cardWidth * 0.22);
                                            if (travel > threshold || v > 650) prev();
                                            else if (travel < -threshold || v < -650) next();
                                        } : undefined}
                                    >
                                        <div
                                            className="h-full w-full"
                                            style={{ transform: `translateZ(${z}px)`, transformStyle: "preserve-3d" }}
                                        >
                                            {renderCard
                                                ? renderCard(item, { active: isActive })
                                                : <DefaultFanCard item={item} />
                                            }
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Arrow */}
                {showArrows && (
                    <button
                        onClick={next}
                        disabled={!canGoNext}
                        className="shrink-0 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 hover:bg-orange-50 hover:border-orange-300 hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 group"
                        aria-label="Next category"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-orange-600 transition-colors" />
                    </button>
                )}
            </div>

            {/* Dots + link */}
            {showDots && (
                <div className="mt-6 flex items-center justify-center gap-3">
                    <div className="flex items-center gap-2">
                        {items.map((it, idx) => (
                            <button
                                key={it.id}
                                onClick={() => setActive(idx)}
                                className={cn(
                                    "transition-all duration-300",
                                    idx === active
                                        ? "w-6 h-2 rounded-full bg-orange-600"
                                        : "w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-500",
                                )}
                                aria-label={`Go to ${it.title}`}
                            />
                        ))}
                    </div>
                    {activeItem?.href && (
                        <Link
                            href={activeItem.href}
                            className="text-gray-400 hover:text-orange-600 transition-colors"
                            aria-label="Open link"
                        >
                            <SquareArrowOutUpRight className="h-4 w-4" />
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}

// ✅ DefaultFanCard — uses next/image, fixes img warning
function DefaultFanCard({ item }) {
    const title = item?.title ?? '';
    const description = item?.description ?? null;
    const imageSrc = item?.imageSrc ?? null;

    return (
        <div className="relative h-full w-full">
            <div className="absolute inset-0">
                {imageSrc ? (
                    <Image
                        src={imageSrc}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, 520px"
                        className="object-cover"
                        draggable={false}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
                        No image
                    </div>
                )}
            </div>
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
            <div className="relative z-10 flex h-full flex-col justify-end p-5">
                <div className="truncate text-lg font-semibold text-white">{title}</div>
                {description && (
                    <div className="mt-1 line-clamp-2 text-sm text-white/80">{description}</div>
                )}
            </div>
        </div>
    );
}