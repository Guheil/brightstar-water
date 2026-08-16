export interface DeliveryCoordinate {
  latitude: number;
  longitude: number;
}

export const DELIVERY_MAP_CONFIG = {
  serviceCenter: {
    latitude: 14.353,
    longitude: 121.0517,
  },
  defaultZoom: 14,
  tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© OpenStreetMap contributors',
} as const;

const EARTH_RADIUS_KM = 6371;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const calculateMapDistanceKm = (
  coordinate: DeliveryCoordinate,
  center: DeliveryCoordinate = DELIVERY_MAP_CONFIG.serviceCenter,
): number => {
  const latitudeDelta = toRadians(coordinate.latitude - center.latitude);
  const longitudeDelta = toRadians(coordinate.longitude - center.longitude);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(center.latitude)) *
      Math.cos(toRadians(coordinate.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return Number((2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))).toFixed(2));
};

export const DELIVERY_MAP_STYLE = {
  version: 8 as const,
  sources: {
    openstreetmap: {
      type: 'raster' as const,
      tiles: [DELIVERY_MAP_CONFIG.tileUrl],
      tileSize: 256,
      attribution: DELIVERY_MAP_CONFIG.attribution,
    },
  },
  layers: [
    {
      id: 'openstreetmap',
      type: 'raster' as const,
      source: 'openstreetmap',
    },
  ],
};
