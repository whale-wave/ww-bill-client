import type { FC } from 'react';
import type { CategoryEntity } from '@/entities/category';
import type { PutRecordApiData, recordChildren } from '@/entities/record';
import type { stateType } from '@/pages/record/bookkeeping/BookkeepingPage';
import { Toast } from 'antd-mobile';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePostRecordMutation, usePutRecordMutation } from '@/entities/record';
import { useTranslation } from '@/shared/i18n';
import { Icon } from '@/shared/ui';
import styles from './keyboard.module.scss';
import { KEYPAD_LAYOUT } from './model/constants';
import { useCalculator } from './model/useCalculator';
import CustomRender from './ui';

interface KeyType {
  change: (bool: boolean) => void;
  keyToggle: number;
  type: string;
  name: string;
  stateList: stateType;
  state: recordChildren;
  defaultSelectDate?: Date;
  categoryList: CategoryEntity[];
}

const Keyboard: FC<KeyType> = ({
  keyToggle,
  name,
  stateList,
  state,
  change,
  defaultSelectDate,
  categoryList,
}) => {
  const { t } = useTranslation('record');
  const calc = useCalculator();
  const navigate = useNavigate();
  const [postRecordMutate] = usePostRecordMutation();
  const [putRecordMutate] = usePutRecordMutation();

  const defaultDateValue = useMemo(
    () => (defaultSelectDate ? dayjs(defaultSelectDate).toDate() : undefined),
    [defaultSelectDate],
  );

  const [inputToggle, setInputToggle] = useState(false);
  const [remarkValue, setRemarkValue] = useState('');
  const [valueDate, setValueDate] = useState(false);
  const [dateValue, setDateValue] = useState(() => defaultDateValue || dayjs().toDate());
  const [dateTimeValue, setDateTimeValue] = useState(0);
  const [active, setActive] = useState(-1);
  const [active1, setActive1] = useState(-1);

  const dataValueText = useMemo(() => dayjs(dateValue).format('YYYY/MM/DD'), [dateValue]);
  const isToday = useMemo(() => dayjs().isSame(dateValue, 'day'), [dateValue]);

  // Touch handlers
  const changeStart = useCallback((index: number) => setActive(index), []);
  const changeMoves = useCallback((e: React.TouchEvent) => {
    const el = e.touches[0].target as HTMLElement;
    const dy = e.touches[0].pageY - el.offsetTop;
    const dx = e.touches[0].pageX - el.offsetLeft;
    if (dy < 0 || dy > 46 || dx < 0 || dx > 80) {
      setActive(-2);
      setActive1(-1);
    }
  }, []);

  const changeEnd = useCallback(
    (_: number, item: { keys: number | string }) => {
      setActive(-1);
      if (active === -2)
        return;
      if (typeof item.keys === 'number')
        calc.inputDigit(item.keys);
      else if (item.keys === '.')
        calc.inputDecimal();
      else if (item.keys === 'x')
        calc.inputDelete();
    },
    [active, calc],
  );

  const inputOperator = useCallback(
    (op: string) => {
      setActive1(-1);
      if (active === -2) {
        setActive(-1);
        return;
      }
      calc.inputOperator(op);
    },
    [active, calc],
  );

  // Submit (create or edit)
  const handleSubmit = useCallback(async () => {
    const category = categoryList.find(i => i.id === keyToggle);
    if (!category) {
      Toast.show({ content: t('bookkeeping.chooseCategory') });
      return;
    }

    setActive1(-1);
    if (active === -2) {
      setActive(-1);
      return;
    }
    if (!calc.canSubmit())
      return;

    const resolvedAmount = calc.resolveAmount();
    if (!resolvedAmount)
      return;

    const time = dayjs(dateValue).toISOString();
    const remark = remarkValue === '' ? name : remarkValue;
    const data: PutRecordApiData = {
      remark,
      categoryId: Number(keyToggle),
      time,
      type: category.type,
      amount: String(Number(resolvedAmount)),
    };

    if (stateList[0] !== '') {
      // Edit
      if (dateTimeValue === 0)
        data.time = stateList[1];
      const edit = await putRecordMutate({ id: `${stateList[2]}`, data });
      if (edit.statusCode === 200) {
        Toast.show({ content: edit.message });
        const chunk = Object.assign(state, data) as any;
        chunk.status = true;
        navigate(`/editing/${state.id}`, { state: chunk, replace: true });
      }
    }
    else {
      // Create
      const res = await postRecordMutate(data);
      if (res.statusCode === 200) {
        Toast.show({ content: res.message });
        if (defaultDateValue) {
          navigate(
            `/record-calendar?selectTime=${dayjs(defaultSelectDate).valueOf()}`,
            { replace: true },
          );
        }
        else {
          navigate(-1);
        }
      }
    }
  }, [
    categoryList,
    keyToggle,
    calc,
    dateValue,
    remarkValue,
    name,
    stateList,
    dateTimeValue,
    putRecordMutate,
    postRecordMutate,
    state,
    navigate,
    defaultDateValue,
    defaultSelectDate,
    active,
    t,
  ]);

  // Init form from edit state
  useEffect(() => {
    if (name) {
      const iconNames = categoryList.map(i => i.name);
      setRemarkValue(iconNames.includes(name) ? '' : name);
    }
    if (stateList[0] !== '') {
      calc.setNum(stateList[0]);
      calc.setTotals(stateList[0]);
      setDateValue(new Date(stateList[1]));
    }
  }, [stateList, name, categoryList, calc]);

  // Prevent context menu
  useEffect(() => {
    const handler = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', handler);
    return () => document.removeEventListener('contextmenu', handler);
  }, []);

  if (keyToggle <= -1)
    return null;

  return (
    <div className={styles.keyBoard}>
      <div className={styles.top}>
        <div>
          <span>
            {t('bookkeeping.note')}
            :
          </span>
          <input
            type="text"
            placeholder={t('bookkeeping.notePlaceholder')}
            value={remarkValue}
            onChange={e => setRemarkValue(e.target.value)}
            onBlur={() => {
              change(false);
              setInputToggle(false);
            }}
            onFocus={() => {
              change(true);
              setInputToggle(true);
            }}
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
                await handleSubmit();
              }
            }}
          />
        </div>
        <span className={styles.total}>{calc.totals}</span>
      </div>

      {!inputToggle && (
        <div className={styles.main}>
          <div className={styles.numbers}>
            {KEYPAD_LAYOUT.map((item, index) => (
              <button
                key={String(item.keys)}
                className={classNames([styles.keys, active === index ? styles.active : ''])}
                onTouchStart={() => changeStart(index)}
                onTouchMove={changeMoves}
                onTouchEnd={() => changeEnd(index, item)}
              >
                {item.keys}
              </button>
            ))}
          </div>

          <div className={styles.right}>
            <div
              className={classNames([styles.bor, active1 === 4 ? styles.active : ''])}
              onTouchStart={() => changeStart(5)}
              onTouchMove={changeMoves}
              onClick={() => setValueDate(true)}
            >
              <CustomRender
                dateValue={dateValue}
                valueDate={valueDate}
                change={() => setValueDate(false)}
                changeTime={(value: Date, time: number) => {
                  setDateTimeValue(time);
                  setDateValue(value);
                }}
              />
              {isToday
                ? (
                    <>
                      <Icon name="today" style={{ fontSize: 21 }} />
                      <span>{t('common:time.today')}</span>
                    </>
                  )
                : <span>{dataValueText}</span>}
            </div>
            {['+', '-'].map(op => (
              <div
                key={op}
                className={classNames([styles.bor, active1 === (op === '+' ? 1 : 2) ? styles.active : ''])}
                onTouchStart={() => changeStart(op === '+' ? 1 : 2)}
                onTouchMove={changeMoves}
                onTouchEnd={() => inputOperator(op)}
              >
                {op}
              </div>
            ))}
            <div
              className={classNames([styles.bor, active1 === 3 ? styles.active1 : ''])}
              onTouchStart={() => changeStart(3)}
              onTouchMove={changeMoves}
              onTouchEnd={handleSubmit}
            >
              {calc.completeText}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Keyboard;
