type ConfirmResolver = (value: boolean) => void;
type AlertResolver = () => void;

type DialogConfirmPayload = {
  type: "confirm";
  message: string;
  title?: string;
  resolver: ConfirmResolver;
};

type DialogAlertPayload = {
  type: "alert";
  message: string;
  title?: string;
  resolver: AlertResolver;
};

export type DialogPayload = DialogConfirmPayload | DialogAlertPayload;

const EVENT_NAME = "smartkids:dialog-open";

export const showAlert = (message: string, title = "Thông báo") => {
  return new Promise<void>((resolve) => {
    const payload: DialogAlertPayload = {
      type: "alert",
      message,
      title,
      resolver: resolve,
    };
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: payload }));
  });
};

export const showConfirm = (message: string, title = "Xác nhận") => {
  return new Promise<boolean>((resolve) => {
    const payload: DialogConfirmPayload = {
      type: "confirm",
      message,
      title,
      resolver: resolve,
    };
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: payload }));
  });
};

export const DIALOG_OPEN_EVENT = EVENT_NAME;

