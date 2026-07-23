import type { FC } from 'react';
import type { recordChildren } from '@/entities/record';
import { useNavigate } from 'react-router-dom';
import { RecordDetailHero } from '@/features/record-workspace';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';

interface stateType {
  state: recordChildren;
}

const Top: FC<stateType> = ({ state }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('record');
  const back = () => {
    playSound.turnPage();
    if (state?.status) {
      navigate('/detail');
    }
    else {
      navigate(-1);
    }
  };

  return (
    <RecordDetailHero
      backLabel={t('common:nav.back')}
      categoryIcon={state.category.icon}
      categoryName={state.category.name}
      onBack={back}
    />
  );
};

export default Top;
