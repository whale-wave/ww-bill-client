export interface CalculatorState {
  totals: string;
  num: string;
  addNum: string;
  addition: string;
  completeText: string;
}
export interface CalculatorOptions {
  initialAmount?: string;
  initialState?: CalculatorState;
}
function isSubmittableAmount(value: string | number): boolean {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0;
}
function toMinorUnits(value: string): number {
  const [integerPart = '0', fractionPart = ''] = value.split('.');
  const isNegative = integerPart.startsWith('-');
  const integerDigits = isNegative ? integerPart.slice(1) : integerPart;
  const minorUnits = Number(integerDigits || '0') * 100
    + Number(fractionPart.padEnd(2, '0').slice(0, 2));
  return isNegative ? -minorUnits : minorUnits;
}
function calculatorActions(state: CalculatorState) {
  const { totals, num, addNum, addition, completeText } = state;
  const nextState = { ...state };
  const setTotals = (value: string) => {
    nextState.totals = value;
  };
  const setNum = (value: string) => {
    nextState.num = value;
  };
  const setAddNum = (value: string) => {
    nextState.addNum = value;
  };
  const setAddition = (value: string) => {
    nextState.addition = value;
  };
  const setCompleteText = (value: string) => {
    nextState.completeText = value;
  };
  const changePing = (keys: string | number, toggle?: number): string | undefined => {
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
            setCompleteText('=');
            return undefined;
          }
          return undefined;
        }
        const n1 = toMinorUnits(num);
        const n2 = toMinorUnits(addNum);
        if (addition === '+') {
          const numericResult = (n1 + n2) / 100;
          if (keys === '' && !isSubmittableAmount(numericResult))
            return undefined;
          const result = String(numericResult);
          setNum(result);
          setAddNum('');
          setTotals(result + keys);
          setAddition(numStr);
          setCompleteText(keys ? '=' : '完成');
          return result;
        }
        if (addition === '-') {
          const numericResult = (n1 - n2) / 100;
          if (keys === '' && !isSubmittableAmount(numericResult))
            return undefined;
          const result = String(numericResult);
          setNum(result);
          setAddNum('');
          setTotals(result + keys);
          setAddition(numStr);
          setCompleteText(keys ? '=' : '完成');
          return result;
        }
      }
      else {
        setAddition(numStr);
        setTotals(num + numStr);
        setCompleteText('=');
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
          setCompleteText('完成');
          return undefined;
        }
        if (newAddNum === '') {
          setAddNum('');
          setTotals(num + addition);
          setCompleteText('=');
          return undefined;
        }
        setAddNum(newAddNum);
        setTotals(num + addition + newAddNum);
      }
    }
    return undefined;
  };
  const inputDigit = (keys: number) => {
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
  };
  const inputDecimal = () => {
    if (totals === '0.00' || totals === '-')
      return;
    changePing('.', 4);
  };
  const inputDelete = () => {
    changePing('x', 5);
  };
  const inputOperator = (op: string) => {
    if (totals === '0' || totals === '0.00' || totals === '-')
      return;
    changePing(op, 3);
  };
  const canSubmit = () => {
    if (!isSubmittableAmount(totals))
      return false;
    if (addition)
      return false;
    return completeText === '完成';
  };
  const canCalculate = () => {
    if ((addition !== '+' && addition !== '-') || addNum === '' || addNum === '.')
      return false;
    const firstAmount = toMinorUnits(num);
    const secondAmount = toMinorUnits(addNum);
    return addition === '+' ? firstAmount + secondAmount > 0 : firstAmount - secondAmount > 0;
  };
  const resolveAmount = (): string | undefined => {
    if (addition === '+' || addition === '-') {
      if (addNum === '' || addNum === '.')
        return undefined;
      return changePing('', 3);
    }
    return canSubmit() ? totals : undefined;
  };
  const inputOperatorState = (op: string) => {
    if (totals === '0' || totals === '0.00' || totals === '-')
      return;
    changePing(op, 3);
  };
  return {
    nextState,
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
    canCalculate,
    setNum,
    setTotals,
    setAddition,
  };
}

export type CalculatorAction
  = | { type: 'digit'; value: number }
    | { type: 'decimal' | 'delete' | 'resolve' }
    | { type: 'operator'; value: string };

export function createCalculatorState({ initialAmount, initialState }: CalculatorOptions = {}): CalculatorState {
  return {
    totals: initialState?.totals ?? initialAmount ?? '0.00',
    num: initialState?.num ?? initialAmount ?? '',
    addNum: initialState?.addNum ?? '',
    addition: initialState?.addition ?? '',
    completeText: initialState?.completeText ?? '完成',
  };
}

export function applyCalculatorAction(state: CalculatorState, action: CalculatorAction) {
  const calculator = calculatorActions(state);
  let amount: string | undefined;
  if (action.type === 'digit')
    calculator.inputDigit(action.value);
  else if (action.type === 'decimal')
    calculator.inputDecimal();
  else if (action.type === 'delete')
    calculator.inputDelete();
  else if (action.type === 'operator')
    calculator.inputOperator(action.value);
  else amount = calculator.resolveAmount();
  return { state: calculator.nextState, amount };
}

export function canSubmitCalculator(state: CalculatorState) {
  return calculatorActions(state).canSubmit();
}

export function canCalculateCalculator(state: CalculatorState) {
  return calculatorActions(state).canCalculate();
}
