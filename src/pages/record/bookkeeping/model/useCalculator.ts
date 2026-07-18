import { useCallback, useState } from 'react';

export interface CalculatorState {
  totals: string;
  num: string;
  addNum: string;
  addition: string;
  completeText: string;
}

export function useCalculator() {
  const [totals, setTotals] = useState('0.00');
  const [num, setNum] = useState('');
  const [addNum, setAddNum] = useState('');
  const [addition, setAddition] = useState('');
  const [completeText, setCompleteText] = useState('完成');

  const changePing = useCallback(
    (keys: string | number, toggle?: number): string | undefined => {
      const join = (arr: string[]) => arr.join('');
      const numStr = String(keys);

      if (toggle === 1) {
        // num digit
        const str = join([num, numStr]);
        setNum(str);
        setTotals(str);
      }
      else if (toggle === 2) {
        // addNum digit
        const str = join([addNum, numStr]);
        setAddNum(str);
        setTotals(num + addition + str);
        setCompleteText('=');
      }
      else if (toggle === 3) {
        // operator (+/-)
        if (addNum !== '') {
          if (addNum === '.') {
            if (keys === '+' || keys === '-') {
              setAddition(numStr);
              setAddNum('');
              setTotals(num + numStr);
              return undefined;
            }
            return undefined;
          }
          const n1 = Number(num) * 100;
          const n2 = Number(addNum) * 100;
          if (addition === '+') {
            const result = String((n1 + n2) / 100);
            setNum(result);
            setAddNum('');
            setTotals(result + keys);
            setAddition(numStr);
            setCompleteText('完成');
            return result;
          }
          if (addition === '-') {
            const result = String((n1 - n2) / 100);
            setNum(result);
            setAddNum('');
            setTotals(result + keys);
            setAddition(numStr);
            setCompleteText('完成');
            return result;
          }
        }
        else {
          setAddition(numStr);
          setTotals(num + numStr);
          return num;
        }
      }
      else if (toggle === 4) {
        // decimal point
        if (!addition.includes('+') && !addition.includes('-')) {
          if (num.includes('.'))
            return undefined;
          if (totals === '0') {
            setNum(`0${numStr}`);
            setTotals(`0${numStr}`);
          }
          else {
            setNum(num + numStr);
            setTotals(num + numStr);
          }
        }
        else {
          if (addNum.includes('.'))
            return undefined;
          setAddNum(addNum + numStr);
          setTotals(num + addition + addNum + numStr);
        }
      }
      else if (toggle === 5) {
        // delete
        if (!addition.includes('+') && !addition.includes('-')) {
          const newNum = num.slice(0, -1);
          if (newNum === '') {
            setNum('');
            setTotals('0');
            return undefined;
          }
          setNum(newNum);
          setTotals(newNum);
        }
        else {
          const lastPlus = totals.lastIndexOf('+');
          const lastMinus = totals.lastIndexOf('-');
          const newAddNum = addNum.slice(0, -1);
          if (lastPlus + 1 === totals.length || lastMinus + 1 === totals.length) {
            setAddition('');
            setTotals(totals.slice(0, -1));
            return undefined;
          }
          if (newAddNum === '') {
            setAddNum('');
            setTotals(num + addition);
            setCompleteText('完成');
            return undefined;
          }
          setAddNum(newAddNum);
          setTotals(num + addition + newAddNum);
        }
      }
      return undefined;
    },
    [num, addNum, addition, totals],
  );

  const inputDigit = useCallback(
    (keys: number) => {
      if (totals === '-' || (totals === '0' && keys === 0))
        return;

      if (addition.includes('+') || addition.includes('-')) {
        if (addNum.includes('.')) {
          if (addNum.length > addNum.indexOf('.') + 2)
            return;
        }
        else if (addNum.length === 8) {
          return;
        }
        changePing(keys, 2);
        return;
      }
      if (num === '0') {
        const str = String(keys);
        setNum(str);
        setTotals(str);
        return;
      }
      if (num !== '') {
        if (num.includes('.')) {
          if (num.length > num.indexOf('.') + 2)
            return;
        }
        else if (num.length === 8) {
          return;
        }
        if (totals.indexOf('-') === 0 && !num.includes('.') && num.length === 9)
          return;
        changePing(keys, 1);
      }
      else {
        const str = String(keys);
        setNum(str);
        setTotals(str);
      }
    },
    [num, addNum, addition, totals, changePing],
  );

  const inputDecimal = useCallback(() => {
    if (totals === '0.00' || totals === '-')
      return;
    changePing('.', 4);
  }, [totals, changePing]);

  const inputDelete = useCallback(() => {
    changePing('x', 5);
  }, [changePing]);

  const inputOperator = useCallback(
    (op: string) => {
      if (totals === '0' || totals === '0.00' || totals === '-')
        return;
      changePing(op, 3);
    },
    [totals, changePing],
  );

  const canSubmit = useCallback(() => {
    if (totals === '0' || totals === '0.00' || totals === '-')
      return false;
    if (addition)
      return false;
    return completeText === '完成';
  }, [totals, addition, completeText]);

  const resolveAmount = useCallback((): string | undefined => {
    if (addition === '+' || addition === '-') {
      if (addNum === '' || addNum === '.')
        return undefined;
      return changePing('', 3);
    }
    return canSubmit() ? totals : undefined;
  }, [addition, addNum, totals, changePing, canSubmit]);

  const inputOperatorState = useCallback(
    (op: string) => {
      if (totals === '0' || totals === '0.00' || totals === '-')
        return;
      changePing(op, 3);
    },
    [totals, changePing],
  );

  return {
    totals,
    num,
    addNum,
    addition,
    completeText,
    inputDigit,
    inputDecimal,
    inputDelete,
    inputOperator,
    inputOperatorState,
    resolveAmount,
    canSubmit,
    setNum,
    setTotals,
    setAddition,
  };
}
