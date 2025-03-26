export type AlertType =
  'Success' |
  'Error' |
  'Warning';

export type Alert = {
  type: AlertType;
  message: string;
  onCancel?: () => void;
} & ({
  type: 'Success';
} | {
  type: 'Error' | 'Warning';
  action: {
    label: string,
    callback: () => void;
  };
});