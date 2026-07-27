import React, { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '@/shared/i18n';
import { RecordSearchHeader } from '@/shared/ui';

interface TopProps {
}

const Top: React.FC<TopProps> = () => {
  const { t } = useTranslation('record');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchRecordKeyword = searchParams.get('q') ?? '';
  const onBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onChange = useCallback((v: string) => {
    setSearchParams({ q: v }, { replace: true });
  }, [setSearchParams]);

  return (
    <RecordSearchHeader
      value={searchRecordKeyword}
      placeholder={t('search.placeholder')}
      onBack={onBack}
      onChange={onChange}
    />
  );
};

export default Top;
