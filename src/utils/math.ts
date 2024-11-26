import { add, bignumber, compareNatural, divide, multiply, subtract } from 'mathjs';

type AmountType = string | number;

class MathHelper {
  private toBigNumber(n: AmountType) {
    return bignumber(n);
  }

  add(n1: AmountType, n2: AmountType) {
    return add(this.toBigNumber(n1), this.toBigNumber(n2));
  }

  subtract(n1: AmountType, n2: AmountType) {
    return subtract(this.toBigNumber(n1), this.toBigNumber(n2));
  }

  multiply(n1: AmountType, n2: AmountType) {
    return multiply(this.toBigNumber(n1), this.toBigNumber(n2));
  }

  divide(n1: AmountType, n2: AmountType) {
    return divide(this.toBigNumber(n1), this.toBigNumber(n2));
  }

  compare(n1: AmountType, n2: AmountType) {
    return compareNatural(this.toBigNumber(n1), this.toBigNumber(n2));
  }
}

export const math = new MathHelper();
