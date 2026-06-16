export * from './baseProps';

export function composeExportComponent<C, O extends Record<string, any>>(com: C, otherCom: O): C & O {
  const res = com as any;
  for (const key in otherCom) {
    if (Object.hasOwn(otherCom, key)) {
      res[key] = otherCom[key];
    }
  }
  return res;
}

export const mergerProps = Object.assign;
