export type BlocRef = {
  isValid: boolean,
  getErrorMessage(): string,
  submit(): Promise<void>,
}