'use client';

import { useEffect, useRef } from 'react';
import { Map, Marker } from 'maplibre-gl';
import { DELIVERY_MAP_STYLE } from '@/config';
import { MapCanvas, MapFrame } from './elements';
import type { DeliveryMapProps } from './interface';

export default function DeliveryMap({ latitude, longitude }: DeliveryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new Map({
      container: containerRef.current,
      center: [longitude, latitude],
      zoom: 16,
      style: DELIVERY_MAP_STYLE,
      attributionControl: { compact: true },
    });
    new Marker().setLngLat([longitude, latitude]).addTo(map);
    return () => map.remove();
  }, [latitude, longitude]);

  return (
    <MapFrame>
      <MapCanvas ref={containerRef} />
    </MapFrame>
  );
}
