import type { FC } from 'react';
import { Capacitor } from '@capacitor/core';
import { Button, ErrorBlock } from 'antd-mobile';
import { Check, CirclePlus, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAndroidReleasesQuery } from '@/entities/app-release';
import { useTranslation } from '@/shared/i18n';
import { openExternalUrl } from '@/shared/lib';
import { NavBar, PageLoadingState } from '@/shared/ui';

const categoryIcon = { feature: CirclePlus, improvement: Wrench, fix: Check } as const;

const AndroidReleaseHistoryPage: FC = () => {
  const { t } = useTranslation('settings');
  const navigate = useNavigate();
  const query = useAndroidReleasesQuery({ enabled: Capacitor.getPlatform() === 'android' });
  return (
    <div className="page-new">
      <NavBar back={t('common:nav.back')} onBack={() => navigate(-1)}>{t('aboutSupport.releaseHistory')}</NavBar>
      <main className="min-h-0 flex-grow overflow-auto px-[18px] pb-8">
        {query.isLoading && <PageLoadingState label={t('aboutSupport.checking')} testId="release-history-loading" />}
        {query.isError && (
          <div className="py-12 text-center">
            <ErrorBlock description={t('aboutSupport.checkFailed')} title={t('aboutSupport.releaseLoadFailed')} />
            <Button color="primary" onClick={() => void query.refetch()} size="small">{t('aboutSupport.checkNow')}</Button>
          </div>
        )}
        {!query.isLoading && !query.isError && query.data.length === 0 && <div className="py-12 text-center"><ErrorBlock description={t('aboutSupport.releaseEmptyHint')} title={t('aboutSupport.releaseEmpty')} /></div>}
        <div className="mx-auto max-w-[520px] space-y-4">
          {query.data.map((release, index) => (
            <article className="rounded-[20px] border border-border-primary bg-white/[0.84] p-5 shadow-ww" key={release.versionCode}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[18px] font-extrabold text-ww-ink">
                    v
                    {release.versionName}
                  </h2>
                  <p className="mt-1 text-[11px] text-ww-soft">{release.publishedAt ? new Date(release.publishedAt).toLocaleDateString() : ''}</p>
                </div>
                {index === 0 && <span className="rounded-full bg-primary-light/65 px-2.5 py-1 text-[11px] font-bold text-primary-deep">{t('aboutSupport.latest')}</span>}
              </div>
              {(release.summary || release.releaseNotes) && <p className="mt-4 text-[13px] leading-5 text-ww-mid">{release.summary || release.releaseNotes}</p>}
              <div className="mt-3 space-y-2">
                {(release.highlights ?? []).map((highlight) => {
                  const Icon = categoryIcon[highlight.category];
                  return (
                    <div className="flex gap-2 text-[12px] leading-5 text-ww-ink" key={`${release.versionCode}-${highlight.text}`}>
                      <Icon className="mt-0.5 shrink-0 text-primary-deep" size={15} strokeWidth={1.8} />
                      <span>{highlight.text}</span>
                    </div>
                  );
                })}
              </div>
              {index === 0 && release.enabled && <button className="mt-4 h-11 w-full rounded-[14px] border-0 bg-primary text-xs font-extrabold text-white shadow-ww-xs" onClick={() => void openExternalUrl(release.downloadUrl)} type="button">{t('aboutSupport.downloadUpdate')}</button>}
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AndroidReleaseHistoryPage;
