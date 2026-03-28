"use client";
/**
 * CropModal — pan-and-zoom image cropper built on the Canvas API.
 *
 * Props:
 *   file        {File}     — the raw File the user selected
 *   aspectRatio {number}   — e.g. 16/9 for banner, 1 for logo/profile
 *   label       {string}   — optional description shown in the header ("Banner Image")
 *   onConfirm   {(File) => void}  — called with the cropped File (JPEG, ≤1920px wide)
 *   onCancel    {() => void}
 */
import React, { useState, useRef, useCallback, useEffect } from "react";
import { X, Check, ZoomIn, ZoomOut, Move } from "lucide-react";

export default function CropModal({ file, aspectRatio = 16 / 9, label = "Image", onConfirm, onCancel }) {
    const [imgSrc,    setImgSrc]    = useState(null);
    const [scale,     setScale]     = useState(1);
    const [offset,    setOffset]    = useState({ x: 0, y: 0 });
    const [dragging,  setDragging]  = useState(false);
    const [dragStart, setDragStart] = useState(null);
    const [boxSize,   setBoxSize]   = useState({ w: 0, h: 0 }); // actual rendered crop-box px

    const imgRef       = useRef(null);
    const containerRef = useRef(null);
    const naturalSize  = useRef({ width: 0, height: 0 });
    const minScale     = useRef(1);

    // ── 1. Load file as data URL ─────────────────────────────────────────────
    useEffect(() => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => setImgSrc(e.target.result);
        reader.readAsDataURL(file);
    }, [file]);

    // ── 2. Read the crop-box rendered size after it appears ──────────────────
    useEffect(() => {
        if (!imgSrc || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setBoxSize({ w: rect.width, h: rect.height });
    }, [imgSrc]);

    // ── 3. When image loads, fit it to cover the crop box ───────────────────
    const handleImgLoad = useCallback(() => {
        const el = imgRef.current;
        if (!el || !containerRef.current) return;
        const { naturalWidth: nw, naturalHeight: nh } = el;
        naturalSize.current = { width: nw, height: nh };

        const rect = containerRef.current.getBoundingClientRect();
        const bw = rect.width;
        const bh = rect.height;
        setBoxSize({ w: bw, h: bh });

        const initScale = Math.max(bw / nw, bh / nh);
        minScale.current = initScale;
        setScale(initScale);
        setOffset({ x: 0, y: 0 });
    }, []);

    // ── 4. Clamp offset so the image always covers the box ──────────────────
    const clamp = useCallback((off, s) => {
        const { width: nw, height: nh } = naturalSize.current;
        const { w: bw, h: bh }          = boxSize;
        if (!bw || !bh) return off;
        const imgW  = nw * s;
        const imgH  = nh * s;
        const maxX  = Math.max(0, (imgW - bw) / 2);
        const maxY  = Math.max(0, (imgH - bh) / 2);
        return {
            x: Math.max(-maxX, Math.min(maxX, off.x)),
            y: Math.max(-maxY, Math.min(maxY, off.y)),
        };
    }, [boxSize]);

    // ── 5. Mouse drag ────────────────────────────────────────────────────────
    const onMouseDown = (e) => {
        e.preventDefault();
        setDragging(true);
        setDragStart({ mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y });
    };

    const onMouseMove = useCallback((e) => {
        if (!dragging || !dragStart) return;
        setOffset(clamp(
            { x: dragStart.ox + (e.clientX - dragStart.mx), y: dragStart.oy + (e.clientY - dragStart.my) },
            scale
        ));
    }, [dragging, dragStart, scale, clamp]);

    const onMouseUp = () => setDragging(false);

    // ── 6. Touch drag ────────────────────────────────────────────────────────
    const onTouchStart = (e) => {
        const t = e.touches[0];
        setDragging(true);
        setDragStart({ mx: t.clientX, my: t.clientY, ox: offset.x, oy: offset.y });
    };

    const onTouchMove = useCallback((e) => {
        if (!dragging || !dragStart) return;
        const t = e.touches[0];
        setOffset(clamp(
            { x: dragStart.ox + (t.clientX - dragStart.mx), y: dragStart.oy + (t.clientY - dragStart.my) },
            scale
        ));
    }, [dragging, dragStart, scale, clamp]);

    // ── 7. Zoom ──────────────────────────────────────────────────────────────
    const handleZoom = (delta) => {
        const newScale = Math.max(minScale.current, Math.min(scale + delta * minScale.current, minScale.current * 4));
        setScale(newScale);
        setOffset(prev => clamp(prev, newScale));
    };

    // ── 8. Confirm: canvas crop → File ──────────────────────────────────────
    const handleConfirm = () => {
        const { width: nw, height: nh } = naturalSize.current;
        const { w: bw, h: bh }          = boxSize;
        const imgW = nw * scale;
        const imgH = nh * scale;

        // Top-left corner of the visible crop box in image-display coordinates
        const boxLeft = (imgW - bw) / 2 - offset.x;
        const boxTop  = (imgH - bh) / 2 - offset.y;

        // Convert to natural-image coordinates
        const srcX = boxLeft / scale;
        const srcY = boxTop  / scale;
        const srcW = bw      / scale;
        const srcH = bh      / scale;

        // Output at 2× for retina, capped at 1920px wide
        const outW = Math.min(1920, Math.round(srcW * 2));
        const outH = Math.round(outW / aspectRatio);

        const canvas = document.createElement("canvas");
        canvas.width  = outW;
        canvas.height = outH;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(imgRef.current, srcX, srcY, srcW, srcH, 0, 0, outW, outH);

        canvas.toBlob(
            (blob) => onConfirm(new File([blob], file.name, { type: "image/jpeg" })),
            "image/jpeg",
            0.92
        );
    };

    if (!imgSrc) return null;

    const { width: nw, height: nh } = naturalSize.current;
    const imgDisplayW = nw * scale;
    const imgDisplayH = nh * scale;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h3 className="font-bold text-gray-900">Crop {label}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Drag to reposition · Zoom to fit more or less</p>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Cancel crop"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Crop canvas */}
                <div className="px-6 pt-6">
                    <div
                        ref={containerRef}
                        style={{ aspectRatio: `${aspectRatio}`, maxWidth: "100%" }}
                        className={`relative overflow-hidden rounded-xl border-2 border-orange-400 mx-auto bg-gray-100 ${
                            dragging ? "cursor-grabbing" : "cursor-grab"
                        } select-none`}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={onMouseUp}
                        onMouseLeave={onMouseUp}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onMouseUp}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            ref={imgRef}
                            src={imgSrc}
                            alt="Crop preview"
                            onLoad={handleImgLoad}
                            draggable={false}
                            style={{
                                width:     imgDisplayW || "100%",
                                height:    imgDisplayH || "auto",
                                position:  "absolute",
                                left:      "50%",
                                top:       "50%",
                                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                                pointerEvents: "none",
                            }}
                        />

                        {/* Corner guide brackets */}
                        <div className="absolute inset-0 pointer-events-none" aria-hidden>
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/80 rounded-tl-sm" />
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/80 rounded-tr-sm" />
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/80 rounded-bl-sm" />
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/80 rounded-br-sm" />
                        </div>
                    </div>

                    {/* Zoom controls */}
                    <div className="flex items-center justify-center gap-3 py-4">
                        <button
                            type="button"
                            onClick={() => handleZoom(-0.15)}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            aria-label="Zoom out"
                        >
                            <ZoomOut className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="flex items-center gap-1.5 text-xs text-gray-400 select-none">
                            <Move className="w-3.5 h-3.5" /> Drag to reposition
                        </span>
                        <button
                            type="button"
                            onClick={() => handleZoom(0.15)}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            aria-label="Zoom in"
                        >
                            <ZoomIn className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="flex-1 px-4 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Apply Crop
                    </button>
                </div>
            </div>
        </div>
    );
}
