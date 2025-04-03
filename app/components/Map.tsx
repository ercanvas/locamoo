"use client";
import { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoiZXJjYW52YXMiLCJhIjoiY204ejliOXV2MGExNTJqcjZvOG1kdjg4ZCJ9._HIYivacdr10IULo_QDyeA';

interface MapProps {
    position: [number, number];
    cityName: string;
    city1: [number, number];
    city2: [number, number];
}

export default function Map({ position, cityName, city1, city2 }: MapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<mapboxgl.Map | null>(null);

    // Memoize the coordinates to maintain reference stability
    const coordinates = useMemo(() => ({
        city1: city1,
        city2: city2,
        position: position
    }), [city1?.[0], city1?.[1], city2?.[0], city2?.[1], position?.[0], position?.[1]]);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        const mapInstance = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/satellite-streets-v12',
            center: coordinates.position,
            zoom: 5,
            pitch: 60,
            bearing: -60,
            antialias: true
        });

        mapInstance.on('load', () => {
            // Add terrain
            mapInstance.addSource('mapbox-dem', {
                'type': 'raster-dem',
                'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
                'tileSize': 512
            });
            mapInstance.setTerrain({ 'source': 'mapbox-dem' });

            // Add route
            if (coordinates.city1 && coordinates.city2) {
                // Add markers for cities
                new mapboxgl.Marker()
                    .setLngLat(coordinates.city1)
                    .addTo(mapInstance);
                new mapboxgl.Marker()
                    .setLngLat(coordinates.city2)
                    .addTo(mapInstance);

                // Draw line between cities
                mapInstance.addSource('route', {
                    'type': 'geojson',
                    'data': {
                        'type': 'Feature',
                        'properties': {},
                        'geometry': {
                            'type': 'LineString',
                            'coordinates': [coordinates.city1, coordinates.city2]
                        }
                    }
                });

                mapInstance.addLayer({
                    'id': 'route',
                    'type': 'line',
                    'source': 'route',
                    'layout': {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    'paint': {
                        'line-color': '#ff0',
                        'line-width': 3,
                        'line-opacity': 0.8
                    }
                });

                // Fit map to show both cities
                const bounds = new mapboxgl.LngLatBounds()
                    .extend(coordinates.city1)
                    .extend(coordinates.city2);
                mapInstance.fitBounds(bounds, {
                    padding: 100,
                    duration: 1000
                });
            }
        });

        setMap(mapInstance);

        return () => {
            mapInstance.remove();
        };
    }, [coordinates]); // Use memoized coordinates as dependency

    return <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />;
}
