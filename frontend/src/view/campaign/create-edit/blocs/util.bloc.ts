export type BlocRef = {
  isValid: boolean,
  submit(): Promise<void>,
  getErrorMessage?(): string,
}