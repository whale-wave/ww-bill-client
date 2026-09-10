import type { RecordLocationErrorReason } from '../model/record-location';
import type {
  RecordLocation,
  RecordLocationCandidate,
  RecordLocationCandidatesResult,
} from '@/entities/record';
import {
  Check,
  LocateFixed,
  MapPin,
  Navigation,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { formatRecordLocationCoordinates } from '@/entities/record';
import { useTranslation } from '@/shared/i18n';
import { AppButton, AppSheet, SheetHeader } from '@/shared/ui';
import {
  canOpenNativeLocationSettings,
  getRecordLocationErrorReason,
  openNativeLocationSettings,
} from '../model/record-location';

interface RecordLocationPickerProps {
  locate: () => Promise<RecordLocation>;
  resolveCandidates: (
    location: RecordLocation,
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
  const [recommendedAddress, setRecommendedAddress] = useState<string>();
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>();
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
      setDraftLocation(nextLocation);
      setLocationCandidates([]);
      setRecommendedAddress(undefined);
      setSelectedCandidateId(undefined);
      setIsLocating(false);
      setIsResolvingLocation(true);
      try {
        const result = await resolveCandidates(nextLocation);
        if (requestSequence !== requestSequenceRef.current)
          return;
        setLocationCandidates(result.candidates);
        setRecommendedAddress(result.recommendedAddress);
        const nearest = result.candidates[0];
        if (choiceSequence === userChoiceSequenceRef.current) {
          if (nearest) {
            setSelectedCandidateId(nearest.id);
            setDraftLocation(current =>
              current ? { ...current, name: nearest.name } : current,
            );
          }
          else if (result.recommendedAddress) {
            setDraftLocation(current =>
              current
                ? { ...current, name: result.recommendedAddress }
                : current,
            );
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

  const handleSelectCandidate = useCallback(
    (candidate: RecordLocationCandidate) => {
      userChoiceSequenceRef.current += 1;
      setSelectedCandidateId(candidate.id);
      setDraftLocation(current =>
        current ? { ...current, name: candidate.name } : current,
      );
    },
    [],
  );
  const handleClearLocation = useCallback(() => {
    userChoiceSequenceRef.current += 1;
    requestSequenceRef.current += 1;
    setDraftLocation(null);
    setLocationCandidates([]);
    setRecommendedAddress(undefined);
    setSelectedCandidateId(undefined);
    setLocationResolveError(false);
    setIsResolvingLocation(false);
  }, []);
  const handleOpenSettings = useCallback(async () => {
    await openNativeLocationSettings(
      errorReason === 'services-disabled' ? 'services' : 'app',
    ).catch(() => undefined);
  }, [errorReason]);

  return (
    <AppSheet
      bodyClassName="flex max-h-[78vh] flex-col overflow-hidden"
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
                <Navigation aria-hidden="true" size={19} strokeWidth={1.9} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-extrabold text-ww-ink">
                  {t('location.currentPosition')}
                </div>
                <div className="mt-0.5 truncate font-number text-[11px] font-semibold text-ww-soft">
                  {formatRecordLocationCoordinates(draftLocation)}
                  {' · '}
                  {t('location.accuracy', {
                    meters: Math.round(draftLocation.accuracy),
                  })}
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
                {!isResolvingLocation
                  && !locationResolveError
                  && !locationCandidates.length
                  && recommendedAddress && (
                  <div className="mt-2 rounded-[10px] bg-surface-subtle px-2.5 py-2 text-[11px] font-semibold text-ww-soft">
                    <span className="font-extrabold">
                      {t('location.recommendedAddress')}
                      ：
                    </span>
                    {recommendedAddress}
                  </div>
                )}
              </div>
            )}
            <label className="mt-3 block">
              <span className="mb-1.5 block text-[12px] font-bold text-ww-soft">
                {t('location.nameLabel')}
              </span>
              <input
                className="h-11 w-full rounded-[13px] border border-solid border-border-primary bg-surface-subtle px-3 text-[14px] font-semibold text-ww-ink outline-none focus:border-primary"
                data-record-location-name-input
                maxLength={120}
                onChange={(event) => {
                  userChoiceSequenceRef.current += 1;
                  setSelectedCandidateId(undefined);
                  setDraftLocation(current =>
                    current
                      ? { ...current, name: event.target.value }
                      : current,
                  );
                }}
                placeholder={t('location.namePlaceholder')}
                type="text"
                value={draftLocation.name ?? ''}
              />
            </label>
          </section>
        )}
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
          onClick={() => {
            const normalized = draftLocation?.name?.trim();
            onConfirm(
              draftLocation
                ? {
                    ...draftLocation,
                    ...(normalized
                      ? { name: normalized }
                      : { name: undefined }),
                  }
                : null,
            );
          }}
          size="large"
        >
          {t('location.confirm')}
        </AppButton>
      </div>
    </AppSheet>
  );
}
