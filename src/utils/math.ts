import { add, bignumber, subtract } from 'mathjs';

type AmountType = string | number;

class Math {
  add(n1: AmountType, n2: AmountType) {
    return add(bignumber(n1), bignumber(n2));
  }

  subtract(n1: AmountType, n2: AmountType) {
    return subtract(bignumber(n1), bignumber(n2));
  }
}

export const math = new Math();
