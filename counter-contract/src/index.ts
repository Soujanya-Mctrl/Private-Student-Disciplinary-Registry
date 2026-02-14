export * as DisciplinaryRecord from "./managed/disciplinary/contract/index.js";
export type DisciplinaryRecordPrivateState = { privateRecord: Record<string, bigint> };
export const createPrivateState = (): DisciplinaryRecordPrivateState => ({
  privateRecord: {},
});
