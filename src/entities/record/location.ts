import type { RecordLocation } from './types';

export function formatRecordLocationCoordinates(location: Pick<RecordLocation, 'latitude' | 'longitude'>) {
  return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
}

export function formatRecordLocationLabel(location: RecordLocation) {
  return location.name?.trim() || formatRecordLocationCoordinates(location);
}
