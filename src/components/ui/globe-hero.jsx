"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import React, { useRef, useEffect } from "react";

const Globe = ({ rotationSpeed, radius }) => {
    const groupRef = useRef(null);

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y += rotationSpeed;
            groupRef.current.rotation.x += rotationSpeed * 0.3;
            groupRef.current.rotation.z += rotationSpeed * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            <mesh>
                <sphereGeometry args={[radius, 64, 64]} />
                <meshBasicMaterial
                    color="#f97316"
                    transparent
                    opacity={0.12}
                    wireframe
                />
            </mesh>
        </group>
    );
};

const DotGlobeHero = React.forwardRef(({
                                           rotationSpeed = 0.005,
                                           globeRadius = 1,
                                           className,
                                           children,
                                           ...props
                                       }, ref) => {

    // ✅ suppress deprecated THREE.Clock warning from react-three-fiber internals
    useEffect(() => {
        const originalWarn = console.warn;
        console.warn = (...args) => {
            if (
                typeof args[0] === 'string' &&
                args[0].includes('THREE.Clock') &&
                args[0].includes('deprecated')
            ) {
                return;
            }
            originalWarn(...args);
        };
        return () => {
            console.warn = originalWarn;
        };
    }, []);

    return (
        <div
            ref={ref}
            className={`relative w-full overflow-hidden ${className || ''}`}
            {...props}
        >
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
                {children}
            </div>

            <div className="absolute inset-0 z-0 pointer-events-none">
                <Canvas>
                    <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={75} />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <Globe rotationSpeed={rotationSpeed} radius={globeRadius} />
                </Canvas>
            </div>
        </div>
    );
});

DotGlobeHero.displayName = "DotGlobeHero";

export { DotGlobeHero };