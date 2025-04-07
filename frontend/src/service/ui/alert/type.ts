export type AlertType =
  'Success' |
  'Error' |
  'Warning';

export type AlertAction = {
  label: string,
  callback: () => void;
}

export type Alert = {
  type: AlertType;
  message: string;
  onCancel?: () => void;
} & ({
  type: 'Success';
} | {
  type: 'Error' | 'Warning';
  actions: AlertAction[];
});