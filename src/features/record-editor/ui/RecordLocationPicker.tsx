import type { RecordLocationErrorReason } from '../model/record-location';
import type {
  CurrentLocationFix,
  RecordLocation,
  RecordLocationCandidate,
  RecordLocationCandidatesResult,
} from '@/entities/record';
import { Check, LocateFixed, MapPin, ShieldAlert, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPoiRecordLocation } from '@/entities/record';
import { useTranslation } from '@/shared/i18n';
import { AppButton, AppSheet, SheetHeader } from '@/shared/ui';
import {
  canOpenNativeLocationSettings,
  getRecordLocationErrorReason,
  openNativeLocationSettings,
} from '../model/record-location';
import { RecordLocationSearchView } from './RecordLocationSearchView';

interface RecordLocationPickerProps {
  locate: () => Promise<CurrentLocationFix | RecordLocation>;
  resolveCandidates: (
    location: Pick<CurrentLocationFix, 'latitude' | 'longitude'>,
  ) => Promise<RecordLocationCandidatesResult>;
  onClose: () => void;
  onConfirm: (location: RecordLocation | null) => void;
  selectedLocation?: RecordLocation | null;
  visible: boolean;
}

export function RecordLocationPicker({
  locate,
  resolveCandidates,
  onClose,
  onConfirm,
  selectedLocation,
  visible,
}: RecordLocationPickerProps) {
  const { t } = useTranslation('record');
  const [draftLocation, setDraftLocation] = useState<RecordLocation | null>(
    selectedLocation ?? null,
  );
  const [errorReason, setErrorReason] = useState<RecordLocationErrorReason>();
  const [isLocating, setIsLocating] = useState(false);
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const [locationResolveError, setLocationResolveError] = useState(false);
  const [locationCandidates, setLocationCandidates] = useState<
    RecordLocationCandidate[]
  >([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>();
  const [currentLocationFix, setCurrentLocationFix] = useState<CurrentLocationFix>();
  const [isSearchView, setIsSearchView] = useState(false);
  const requestSequenceRef = useRef(0);
  const userChoiceSequenceRef = useRef(0);
  const canOpenSettings = canOpenNativeLocationSettings();
  useEffect(
    () => () => {
      requestSequenceRef.current += 1;
    },
    [],
  );

  const handleLocate = useCallback(async () => {
    if (isLocating)
      return;
    setErrorReason(undefined);
    setLocationResolveError(false);
    setIsLocating(true);
    const requestSequence = ++requestSequenceRef.current;
    const choiceSequence = userChoiceSequenceRef.current;
    try {
      const nextLocation = await locate();
      if (requestSequence !== requestSequenceRef.current)
        return;
      if ('coordinateSystem' in nextLocation && nextLocation.coordinateSystem === 'wgs84' && 'accuracy' in nextLocation && 'capturedAt' in nextLocation)
        setCurrentLocationFix(nextLocation);
      setDraftLocation(toDraftLocation(nextLocation));
      setLocationCandidates([]);
      setSelectedCandidateId(undefined);
      setIsLocating(false);
      setIsResolvingLocation(true);
      try {
        const result = await resolveCandidates(nextLocation);
        if (requestSequence !== requestSequenceRef.current)
          return;
        setLocationCandidates(result.candidates);
        const nearest = result.candidates[0];
        if (choiceSequence === userChoiceSequenceRef.current) {
          if (nearest) {
            setSelectedCandidateId(nearest.id);
            setDraftLocation(createPoiRecordLocation(nearest));
          }
        }
      }
      catch {
        if (requestSequence === requestSequenceRef.current)
          setLocationResolveError(true);
      }
      finally {
        if (requestSequence === requestSequenceRef.current)
          setIsResolvingLocation(false);
      }
    }
    catch (error) {
      if (requestSequence === requestSequenceRef.current)
        setErrorReason(getRecordLocationErrorReason(error));
    }
    finally {
      if (requestSequence === requestSequenceRef.current)
        setIsLocating(false);
    }
  }, [isLocating, locate, resolveCandidates]);

  const handleOpenSearch = useCallback(() => {
    requestSequenceRef.current += 1;
    setIsSearchView(true);
  }, []);

  const handleSelectCandidate = useCallback(
    (candidate: RecordLocationCandidate) => {
      userChoiceSequenceRef.current += 1;
      setSelectedCandidateId(candidate.id);
      setDraftLocation(createPoiRecordLocation(candidate));
    },
    [],
  );
  const handleClearLocation = useCallback(() => {
    userChoiceSequenceRef.current += 1;
    requestSequenceRef.current += 1;
    setDraftLocation(null);
    setLocationCandidates([]);
    setSelectedCandidateId(undefined);
    setLocationResolveError(false);
    setIsResolvingLocation(false);
  }, []);
  const handleOpenSettings = useCallback(async () => {
    const opened = await openNativeLocationSettings(
      errorReason === 'services-disabled' ? 'services' : 'app',
    ).catch(() => undefined);
    if (!opened)
      setErrorReason('permission-denied');
  }, [errorReason]);
  const canConfirm = draftLocation === null || Boolean(draftLocation);

  return (
    <AppSheet
      bodyClassName="ww-app-sheet--fullscreen flex h-[100dvh] max-h-none flex-col overflow-hidden"
      destroyOnClose
      onClose={onClose}
      onMaskClick={onClose}
      position="bottom"
      visible={visible}
    >
      <SheetHeader
        closeLabel={t('location.close')}
        icon={<MapPin size={20} strokeWidth={1.8} />}
        onClose={onClose}
        description={t('location.subtitle')}
        title={t('location.title')}
      />
      {isSearchView
        ? (
            <div className="min-h-0 overflow-y-auto">
              <RecordLocationSearchView
                bias={currentLocationFix
                  ? {
                      latitude: currentLocationFix.latitude,
                      longitude: currentLocationFix.longitude,
                    }
                  : undefined}
                onBack={() => setIsSearchView(false)}
                onSelect={location => onConfirm(location)}
              />
            </div>
          )
        : (
            <div className="min-h-0 overflow-y-auto px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4">
              <AppButton
                fullWidth
                loading={isLocating}
                loadingLabel={t('location.locating')}
                onClick={() => void handleLocate()}
                variant="secondary"
              >
                <LocateFixed aria-hidden="true" size={18} strokeWidth={1.9} />
                {draftLocation ? t('location.relocate') : t('location.useCurrent')}
              </AppButton>
              {errorReason && (
                <section
                  className="mt-3 rounded-[18px] border border-border-primary bg-primary-light/25 p-4"
                  data-record-location-error={errorReason}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-white text-primary-deep">
                      <ShieldAlert aria-hidden="true" size={18} strokeWidth={1.9} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-extrabold text-ww-ink">
                        {t(`location.errors.${errorReason}.title`)}
                      </div>
                      <div className="mt-1 text-[12px] font-semibold leading-5 text-ww-soft">
                        {t(`location.errors.${errorReason}.description`)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <AppButton
                      className="flex-1"
                      onClick={() => void handleLocate()}
                      size="compact"
                      variant="secondary"
                    >
                      {t('location.retry')}
                    </AppButton>
                    {canOpenSettings
                      && (errorReason === 'permission-denied'
                        || errorReason === 'services-disabled') && (
                      <AppButton
                        className="flex-1"
                        onClick={() => void handleOpenSettings()}
                        size="compact"
                      >
                        {t('location.openSettings')}
                      </AppButton>
                    )}
                  </div>
                </section>
              )}
              {draftLocation && (
                <section
                  className="mt-3 rounded-[18px] border border-primary bg-white p-4 shadow-ww-xs"
                  data-record-location-selected
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-primary-light text-primary-deep">
                      <MapPin aria-hidden="true" size={19} strokeWidth={1.9} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-extrabold text-ww-ink">
                        {draftLocation.name || t('location.waitingForPlace')}
                      </div>
                      <div className="mt-0.5 truncate text-[11px] font-semibold text-ww-soft">
                        {t('location.selectionHint')}
                      </div>
                    </div>
                    <Check
                      aria-hidden="true"
                      className="text-primary-deep"
                      size={20}
                      strokeWidth={2.2}
                    />
                  </div>
                  {(isResolvingLocation
                    || locationCandidates.length > 0
                    || locationResolveError) && (
                    <div className="mt-4 border-t border-border-primary pt-3">
                      <div className="mb-2 text-[12px] font-bold text-ww-soft">
                        {t('location.nearby')}
                      </div>
                      {isResolvingLocation && (
                        <div className="text-[12px] font-semibold text-ww-soft">
                          {t('location.resolving')}
                        </div>
                      )}
                      {locationResolveError && !isResolvingLocation && (
                        <div className="flex items-center justify-between gap-3 text-[12px] font-semibold text-ww-soft">
                          <span>{t('location.resolveFailed')}</span>
                          <button
                            className="shrink-0 font-extrabold text-primary-deep"
                            onClick={() => void handleLocate()}
                            type="button"
                          >
                            {t('location.resolveRetry')}
                          </button>
                        </div>
                      )}
                      {!isResolvingLocation
                        && !locationResolveError
                        && locationCandidates.map(candidate => (
                          <button
                            aria-pressed={selectedCandidateId === candidate.id}
                            className="flex w-full items-center gap-3 rounded-[12px] py-2 text-left"
                            key={candidate.id}
                            onClick={() => handleSelectCandidate(candidate)}
                            type="button"
                          >
                            <span
                              className={
                                selectedCandidateId === candidate.id
                                  ? 'text-primary-deep'
                                  : 'text-border-primary'
                              }
                            >
                              ◉
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[13px] font-extrabold text-ww-ink">
                                {candidate.name}
                              </span>
                              {candidate.address && (
                                <span className="block truncate text-[11px] font-semibold text-ww-soft">
                                  {candidate.address}
                                </span>
                              )}
                            </span>
                            {candidate.distanceMeters !== undefined && (
                              <span className="shrink-0 text-[11px] font-semibold text-ww-soft">
                                {t('location.distance', {
                                  meters: Math.round(candidate.distanceMeters),
                                })}
                              </span>
                            )}
                          </button>
                        ))}
                      {!isResolvingLocation
                        && !locationResolveError
                        && locationCandidates.length === 0 && (
                        <div className="text-[12px] font-semibold text-ww-soft">
                          {t('location.noNearby')}
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}
              <button
                className="mt-3 flex min-h-11 w-full items-center gap-3 rounded-[16px] border border-solid border-primary/40 bg-primary-light/20 px-3 text-left text-[13px] font-bold text-primary-deep"
                onClick={handleOpenSearch}
                type="button"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-[11px] bg-white"><LocateFixed aria-hidden="true" size={16} /></span>
                <span className="flex-1">{t('location.searchOther')}</span>
              </button>
              <button
                aria-pressed={draftLocation === null}
                className="mt-3 flex min-h-11 w-full items-center gap-3 rounded-[16px] border border-solid border-border-primary bg-white px-3 text-left text-[13px] font-bold text-ww-mid active:bg-primary-light/25"
                onClick={handleClearLocation}
                type="button"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-[11px] bg-surface-subtle text-ww-soft">
                  <X size={16} />
                </span>
                <span className="flex-1">{t('location.doNotRecord')}</span>
                {draftLocation === null && (
                  <Check aria-hidden="true" className="text-primary-deep" size={18} />
                )}
              </button>
              {!canOpenSettings && errorReason === 'permission-denied' && (
                <p className="mt-3 text-[11px] font-semibold leading-5 text-ww-soft">
                  {t('location.webPermissionGuide')}
                </p>
              )}
              <AppButton
                className="mt-4"
                fullWidth
                disabled={!canConfirm}
                onClick={() => {
                  const normalized = draftLocation?.name?.trim();
                  onConfirm(
                    draftLocation
                      ? {
                          ...draftLocation,
                          ...(normalized ? { name: normalized } : {}),
                        }
                      : null,
                  );
                }}
                size="large"
              >
                {t('location.confirm')}
              </AppButton>
            </div>
          )}
    </AppSheet>
  );
}

function toDraftLocation(location: CurrentLocationFix | RecordLocation): RecordLocation {
  if ('coordinateSystem' in location && location.coordinateSystem === 'wgs84' && !('source' in location))
    return { ...location, source: 'device' };
  return location as RecordLocation;
}
