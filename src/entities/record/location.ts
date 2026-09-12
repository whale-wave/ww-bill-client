import type { RecordLocationCandidate } from './api';

import type { PoiRecordLocation, RecordLocation } from './types';

export function formatRecordLocationCoordinates(location: Pick<RecordLocation, 'latitude' | 'longitude'>) {
  return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
}

export function formatRecordLocationLabel(location: RecordLocation) {
  return location.name?.trim() || formatRecordLocationCoordinates(location);
}

export function createPoiRecordLocation(candidate: RecordLocationCandidate, selectedAt = new Date().toISOString()): PoiRecordLocation {
  return {
    source: 'poi',
    provider: candidate.provider,
    coordinateSystem: candidate.coordinateSystem,
    poiId: candidate.id,
    name: candidate.name,
    ...(candidate.address ? { address: candidate.address } : {}),
    ...(candidate.adcode !== undefined ? { adcode: candidate.adcode } : {}),
    ...(candidate.province ? { province: candidate.province } : {}),
    ...(candidate.city ? { city: candidate.city } : {}),
    ...(candidate.district ? { district: candidate.district } : {}),
    ...(candidate.category ? { category: candidate.category } : {}),
    latitude: candidate.latitude,
    longitude: candidate.longitude,
    selectedAt,
  };
}
