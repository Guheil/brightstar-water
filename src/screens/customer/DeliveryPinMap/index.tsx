'use client';

import { useEffect, useRef, useState } from 'react';
import { LocateFixed } from 'lucide-react';
import { Map, Marker } from 'maplibre-gl';
import { calculateMapDistanceKm, DELIVERY_MAP_CONFIG, DELIVERY_MAP_STYLE } from '@/config';
import { LocationButton, LocationStatus, MapCanvas, MapFrame, MapHelp, MapToolbar } from './elements';
import type { DeliveryPinMapProps } from './interface';

export default function DeliveryPinMap({
  initialCoordinate = DELIVERY_MAP_CONFIG.serviceCenter,
  onChange,
  allowCurrentLocation = true,
  reportInitial = true,
}: DeliveryPinMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const [locationStatus, setLocationStatus] = useState('');
  const [locating, setLocating] = useState(false);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const reportLocation = (longitude: number, latitude: number) => {
    onChangeRef.current({ latitude, longitude, distanceKm: calculateMapDistanceKm({ latitude, longitude }) });
  };

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
    mapRef.current = map;
    markerRef.current = marker;

    marker.on('dragend', () => {
      const coordinate = marker.getLngLat();
      setLocationStatus('Pin adjusted manually.');
      reportLocation(coordinate.lng, coordinate.lat);
    });
    map.on('click', (event) => {
      marker.setLngLat(event.lngLat);
      setLocationStatus('Pin placed on the map.');
      reportLocation(event.lngLat.lng, event.lngLat.lat);
    });
    if (reportInitial) reportLocation(initialCoordinate.longitude, initialCoordinate.latitude);

    return () => {
      mapRef.current = null;
      markerRef.current = null;
      map.remove();
    };
  }, [initialCoordinate.latitude, initialCoordinate.longitude, reportInitial]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Current location is not available in this browser. You can still place the pin manually.');
      return;
    }
    setLocating(true);
    setLocationStatus('Finding your current location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        markerRef.current?.setLngLat([longitude, latitude]);
        mapRef.current?.easeTo({ center: [longitude, latitude], zoom: 16, duration: 700 });
        reportLocation(longitude, latitude);
        setLocationStatus(`Location found within approximately ${Math.round(accuracy)} meters. Drag the pin if needed.`);
        setLocating(false);
      },
      () => {
        setLocationStatus('Location access was not available. Place the pin manually instead.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  };

  return (
    <MapFrame>
      <MapCanvas ref={containerRef} />
      <MapToolbar>
        <MapHelp>Click the map or drag the marker to the exact delivery point.</MapHelp>
        {allowCurrentLocation ? (
          <LocationButton disabled={locating} onClick={useCurrentLocation} startIcon={<LocateFixed size={17} />} type="button" variant="outlined">
            {locating ? 'Finding location' : 'Use my current location'}
          </LocationButton>
        ) : null}
      </MapToolbar>
      {locationStatus ? <LocationStatus role="status">{locationStatus}</LocationStatus> : null}
    </MapFrame>
  );
}
