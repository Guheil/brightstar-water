'use client';

import { useEffect, useRef } from 'react';
import { Map, Marker } from 'maplibre-gl';
import {
  calculateMapDistanceKm,
  DELIVERY_MAP_CONFIG,
  DELIVERY_MAP_STYLE,
} from '@/config';
import { MapCanvas, MapFrame, MapHelp } from './elements';
import type { DeliveryPinMapProps } from './interface';

export default function DeliveryPinMap({
  initialCoordinate = DELIVERY_MAP_CONFIG.serviceCenter,
  onChange,
}: DeliveryPinMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new Map({
      container: containerRef.current,
      center: [initialCoordinate.longitude, initialCoordinate.latitude],
      zoom: DELIVERY_MAP_CONFIG.defaultZoom,
      style: DELIVERY_MAP_STYLE,
      attributionControl: { compact: true },
    });
    const marker = new Marker({ draggable: true })
      .setLngLat([initialCoordinate.longitude, initialCoordinate.latitude])
      .addTo(map);

    const reportLocation = (longitude: number, latitude: number) => {
      onChangeRef.current({
        latitude,
        longitude,
        distanceKm: calculateMapDistanceKm({ latitude, longitude }),
      });
    };

    marker.on('dragend', () => {
      const coordinate = marker.getLngLat();
      reportLocation(coordinate.lng, coordinate.lat);
    });

    map.on('click', (event) => {
      marker.setLngLat(event.lngLat);
      reportLocation(event.lngLat.lng, event.lngLat.lat);
    });

    return () => map.remove();
  }, [initialCoordinate.latitude, initialCoordinate.longitude]);

  return (
    <MapFrame>
      <MapCanvas ref={containerRef} />
      <MapHelp>Click the map or drag the marker to the exact delivery point.</MapHelp>
    </MapFrame>
  );
}
