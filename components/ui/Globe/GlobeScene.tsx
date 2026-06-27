'use client'

import { useRef, useState, useMemo, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'

/* ═══════════════════════════════════════════════════════════════
   COUNTRY DATA
   ═══════════════════════════════════════════════════════════════ */
export interface CountryMarker {
    code: string
    name: string
    lat: number
    lng: number
    color: string
}

export const COUNTRIES: CountryMarker[] = [
    { code: 'us', name: 'United States', lat: 39.8, lng: -98.5, color: '#00AAEE' },
    { code: 'gb', name: 'United Kingdom', lat: 54.0, lng: -2.0, color: '#00AAEE' },
    { code: 'ru', name: 'Russia', lat: 61.5, lng: 105.3, color: '#00AAEE' },
    { code: 'cn', name: 'China', lat: 35.8, lng: 104.1, color: '#00AAEE' },
    { code: 'in', name: 'India', lat: 20.5, lng: 78.9, color: '#00AAEE' },
    { code: 'jp', name: 'Japan', lat: 36.2, lng: 138.2, color: '#00AAEE' },
    { code: 'de', name: 'Germany', lat: 51.1, lng: 10.4, color: '#00AAEE' },
    { code: 'fr', name: 'France', lat: 46.6, lng: 2.2, color: '#00AAEE' },
    { code: 'br', name: 'Brazil', lat: -14.2, lng: -51.9, color: '#00AAEE' },
    { code: 'au', name: 'Australia', lat: -25.2, lng: 133.7, color: '#00AAEE' },
    { code: 'ca', name: 'Canada', lat: 56.1, lng: -106.3, color: '#00AAEE' },
    { code: 'za', name: 'South Africa', lat: -30.5, lng: 22.9, color: '#00AAEE' },
    { code: 'kr', name: 'South Korea', lat: 35.9, lng: 127.7, color: '#00AAEE' },
    { code: 'mx', name: 'Mexico', lat: 23.6, lng: -102.5, color: '#00AAEE' },
    { code: 'it', name: 'Italy', lat: 41.8, lng: 12.5, color: '#00AAEE' },
    { code: 'sa', name: 'Saudi Arabia', lat: 23.8, lng: 45.0, color: '#00AAEE' },
    { code: 'ng', name: 'Nigeria', lat: 9.0, lng: 8.6, color: '#00AAEE' },
    { code: 'ar', name: 'Argentina', lat: -38.4, lng: -63.6, color: '#00AAEE' },
    { code: 'eg', name: 'Egypt', lat: 26.8, lng: 30.8, color: '#00AAEE' },
    { code: 'id', name: 'Indonesia', lat: -0.7, lng: 113.9, color: '#00AAEE' },
    { code: 'tr', name: 'Turkey', lat: 38.9, lng: 35.2, color: '#00AAEE' },
    { code: 'pk', name: 'Pakistan', lat: 30.3, lng: 69.3, color: '#00AAEE' },
    { code: 'ua', name: 'Ukraine', lat: 48.3, lng: 31.1, color: '#00AAEE' },
    { code: 'il', name: 'Israel', lat: 31.0, lng: 34.8, color: '#00AAEE' },
]

/* ═══════════════════════════════════════════════════════════════ */
function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)
    return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    )
}

/* ═══════════════════════════════════════════════════════════════
   WORLD OUTLINES — fetched from TopoJSON atlas
   ═══════════════════════════════════════════════════════════════ */
function WorldOutlines({ radius }: { radius: number }) {
    const groupRef = useRef<THREE.Group>(null)
    const [lineSegments, setLineSegments] = useState<THREE.LineSegments | null>(null)

    useEffect(() => {
        let cancelled = false
        async function loadWorld() {
            try {
                const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
                const topology = await res.json()
                if (cancelled) return

                const transform = topology.transform
                // Decode all arcs from delta-encoded TopoJSON
                const decodedArcs: [number, number][][] = topology.arcs.map((arc: any[]) => {
                    let x = 0, y = 0
                    return arc.map((pt: any) => {
                        const dx = pt[0], dy = pt[1]
                        x += dx; y += dy
                        return [
                            x * transform.scale[0] + transform.translate[0],
                            y * transform.scale[1] + transform.translate[1]
                        ] as [number, number]
                    })
                })

                // Build line segments from all arcs
                const positions: number[] = []
                for (const arc of decodedArcs) {
                    for (let i = 0; i < arc.length - 1; i++) {
                        const v1 = latLngToVec3(arc[i][1], arc[i][0], radius + 0.005)
                        const v2 = latLngToVec3(arc[i + 1][1], arc[i + 1][0], radius + 0.005)
                        positions.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z)
                    }
                }

                const geometry = new THREE.BufferGeometry()
                geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
                const material = new THREE.LineBasicMaterial({
                    color: new THREE.Color('#00AAEE'),
                    transparent: true,
                    opacity: 0.55,
                })
                const segments = new THREE.LineSegments(geometry, material)
                if (!cancelled) setLineSegments(segments)
            } catch (err) {
                console.warn('Failed to load world atlas:', err)
            }
        }
        loadWorld()
        return () => { cancelled = true }
    }, [radius])

    if (!lineSegments) return null
    return <primitive object={lineSegments} />
}

/* ═══════════════════════════════════════════════════════════════
   COUNTRY PIN — zine-styled markers
   ═══════════════════════════════════════════════════════════════ */
function CountryPin({
    country, isSelected, isHovered, onSelect, onHover, onUnhover,
}: {
    country: CountryMarker; isSelected: boolean; isHovered: boolean
    onSelect: (c: CountryMarker) => void; onHover: (c: CountryMarker) => void; onUnhover: () => void
}) {
    const meshRef = useRef<THREE.Mesh>(null)
    const pos = useMemo(() => latLngToVec3(country.lat, country.lng, 2.03), [country])
    const scale = isSelected ? 1.8 : isHovered ? 1.4 : 1

    useFrame((_, delta) => {
        if (meshRef.current) meshRef.current.rotation.y += delta * 1.5
    })

    return (
        <group position={pos}>
            <mesh
                onPointerDown={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); onSelect(country) }}
                onPointerEnter={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); onHover(country); document.body.style.cursor = 'pointer' }}
                onPointerLeave={() => { onUnhover(); document.body.style.cursor = 'default' }}
            >
                <sphereGeometry args={[0.15, 8, 8]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            <mesh ref={meshRef} scale={scale}>
                <octahedronGeometry args={[0.05, 0]} />
                <meshStandardMaterial
                    color="#00AAEE"
                    emissive="#00AAEE"
                    emissiveIntensity={isSelected ? 1.2 : isHovered ? 0.7 : 0.4}
                    metalness={0.3} roughness={0.4}
                />
            </mesh>

            <mesh rotation={[Math.PI / 2, 0, 0]} scale={isSelected ? 1.6 : isHovered ? 1.3 : 1}>
                <ringGeometry args={[0.06, 0.09, 6]} />
                <meshBasicMaterial color="#00AAEE" transparent opacity={isSelected ? 1 : isHovered ? 0.7 : 0.35} side={THREE.DoubleSide} />
            </mesh>

            {isSelected && <PulseRing />}

            {(isHovered || isSelected) && (
                <Html center style={{ pointerEvents: 'none', transform: 'translateY(-28px)' }}>
                    <div className={`px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border-3 ${isSelected ? 'bg-[#000000] text-[#00AAEE] border-[#000000]' : 'bg-[#F2F2F2] text-[#000000] border-[#000000]'}`}
                        style={{ boxShadow: '3px 3px 0px #000000' }}>
                        {country.name}
                    </div>
                </Html>
            )}
        </group>
    )
}

function PulseRing() {
    const ref = useRef<THREE.Mesh>(null)
    useFrame((_, delta) => {
        if (!ref.current) return
        const s = ref.current.scale.x + delta * 0.8
        ref.current.scale.set(s > 2.5 ? 1 : s, s > 2.5 ? 1 : s, s > 2.5 ? 1 : s)
        ;(ref.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - (s - 1) / 1.5)
    })
    return (
        <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.1, 0.12, 6]} />
            <meshBasicMaterial color="#00AAEE" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
    )
}

/* ═══════════════════════════════════════════════════════════════
   GLOBE SPHERE — dithered zine style
   ═══════════════════════════════════════════════════════════════ */
function Globe({
    selectedCountry, hoveredCountry, onSelectCountry, onHoverCountry, onUnhoverCountry,
}: {
    selectedCountry: CountryMarker | null; hoveredCountry: CountryMarker | null
    onSelectCountry: (c: CountryMarker) => void; onHoverCountry: (c: CountryMarker) => void; onUnhoverCountry: () => void
}) {
    const globeRef = useRef<THREE.Group>(null)

    useFrame((_, delta) => {
        if (globeRef.current) globeRef.current.rotation.y += delta * 0.12
    })

    return (
        <group ref={globeRef}>
            {/* Main sphere */}
            <mesh>
                <sphereGeometry args={[2, 64, 64]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.05} roughness={0.95} transparent opacity={0.92} />
            </mesh>

            {/* Inner glow sphere */}
            <mesh>
                <sphereGeometry args={[1.98, 32, 32]} />
                <meshBasicMaterial color="#00AAEE" transparent opacity={0.03} />
            </mesh>

            {/* World country outlines */}
            <WorldOutlines radius={2} />

            {/* Grid lines */}
            <GlobeGrid radius={2.003} />

            {/* Country markers */}
            {COUNTRIES.map((c) => (
                <CountryPin key={c.code} country={c}
                    isSelected={selectedCountry?.code === c.code}
                    isHovered={hoveredCountry?.code === c.code}
                    onSelect={onSelectCountry} onHover={onHoverCountry} onUnhover={onUnhoverCountry}
                />
            ))}
        </group>
    )
}

/* ═══════════════════════════════════════════════════════════════
   GRID — subtle lat/lng lines
   ═══════════════════════════════════════════════════════════════ */
function GlobeGrid({ radius }: { radius: number }) {
    const gridRef = useRef<THREE.Group>(null)
    useEffect(() => {
        if (!gridRef.current) return
        const positions: number[] = []
        for (let lat = -60; lat <= 60; lat += 30) {
            for (let lng = 0; lng < 360; lng += 5) {
                const v1 = latLngToVec3(lat, lng, radius)
                const v2 = latLngToVec3(lat, lng + 5, radius)
                positions.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z)
            }
        }
        for (let lng = 0; lng < 360; lng += 30) {
            for (let lat = -90; lat < 90; lat += 5) {
                const v1 = latLngToVec3(lat, lng, radius)
                const v2 = latLngToVec3(lat + 5, lng, radius)
                positions.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z)
            }
        }
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        const mat = new THREE.LineBasicMaterial({ color: '#00AAEE', transparent: true, opacity: 0.06 })
        gridRef.current.add(new THREE.LineSegments(geo, mat))
    }, [radius])
    return <group ref={gridRef} />
}

/* ═══════════════════════════════════════════════════════════════
   ATMOSPHERE — lime glow
   ═══════════════════════════════════════════════════════════════ */
function Atmosphere() {
    return (
        <mesh scale={[1.12, 1.12, 1.12]}>
            <sphereGeometry args={[2, 64, 64]} />
            <shaderMaterial
                vertexShader={`varying vec3 vNormal; void main(){vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`}
                fragmentShader={`varying vec3 vNormal; void main(){float i=pow(0.6-dot(vNormal,vec3(0,0,1)),2.0);gl_FragColor=vec4(0.8,1.0,0.0,1.0)*i;}`}
                blending={THREE.AdditiveBlending} side={THREE.BackSide} transparent
            />
        </mesh>
    )
}

/* ═══════════════════════════════════════════════════════════════
   CANVAS WRAPPER
   ═══════════════════════════════════════════════════════════════ */
export default function GlobeScene({
    selectedCountry, hoveredCountry, onSelectCountry, onHoverCountry, onUnhoverCountry,
}: {
    selectedCountry: CountryMarker | null; hoveredCountry: CountryMarker | null
    onSelectCountry: (c: CountryMarker) => void; onHoverCountry: (c: CountryMarker) => void; onUnhoverCountry: () => void
}) {
    return (
        <Canvas camera={{ position: [0, 0, 5.2], fov: 45 }} style={{ background: 'transparent' }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 3, 5]} intensity={0.8} />
            <directionalLight position={[-5, -3, -5]} intensity={0.2} color="#00AAEE" />
            <pointLight position={[0, 0, 5]} intensity={0.3} color="#00AAEE" />

            <Globe selectedCountry={selectedCountry} hoveredCountry={hoveredCountry}
                onSelectCountry={onSelectCountry} onHoverCountry={onHoverCountry} onUnhoverCountry={onUnhoverCountry} />
            <Atmosphere />

            <OrbitControls enableZoom enablePan={false} minDistance={3.5} maxDistance={8} rotateSpeed={0.5} zoomSpeed={0.8} />
        </Canvas>
    )
}
