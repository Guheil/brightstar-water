import type { PsgcOption } from '@/lib/addresses/types';

export const PSGC_FALLBACK = {
  regions: [
    { code: '0400000000', name: 'Region IV-A (CALABARZON)' },
  ] satisfies PsgcOption[],
  provinces: [
    { code: '0403400000', name: 'Laguna', regionCode: '0400000000' },
  ] satisfies PsgcOption[],
  municipalities: [
    { code: '0403425000', name: 'City of San Pedro', regionCode: '0400000000', provinceCode: '0403400000' },
  ] satisfies PsgcOption[],
  barangays: [
    ['0403425001', 'Bagong Silang'], ['0403425002', 'Cuyab'], ['0403425003', 'Estrella'],
    ['0403425004', 'G.S.I.S.'], ['0403425005', 'Landayan'], ['0403425006', 'Langgam'],
    ['0403425007', 'Laram'], ['0403425008', 'Magsaysay'], ['0403425010', 'Nueva'],
    ['0403425011', 'Poblacion'], ['0403425013', 'Riverside'], ['0403425014', 'San Antonio'],
    ['0403425015', 'San Roque'], ['0403425016', 'San Vicente'], ['0403425017', 'Santo Niño'],
    ['0403425018', 'United Bayanihan'], ['0403425019', 'United Better Living'],
    ['0403425020', 'Sampaguita Village'], ['0403425021', 'Calendola'], ['0403425022', 'Narra'],
    ['0403425023', 'Chrysanthemum'], ['0403425024', 'Fatima'], ['0403425025', 'Maharlika'],
    ['0403425026', 'Pacita 1'], ['0403425027', 'Pacita 2'], ['0403425028', 'Rosario'],
    ['0403425029', 'San Lorenzo Ruiz'],
  ].map(([code, name]) => ({
    code,
    name,
    regionCode: '0400000000',
    provinceCode: '0403400000',
    municipalityCode: '0403425000',
  })) satisfies PsgcOption[],
} as const;
