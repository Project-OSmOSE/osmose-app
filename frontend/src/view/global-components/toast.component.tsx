import { FC, useEffect, useState } from 'react';

// String enum matching css rules
enum ToastStatus {
  hidden = 'toasty-hidden',
  showing = 'toasty-showing',
  visible = 'toasty-visible',
  hiding = 'toasty-hiding',
}

export type ToastMessage = {
  messages: Array<string>,
  level: 'danger' | 'success' | 'primary',
};

type ToastProps = {
  toastMsg?: ToastMessage,
};

export const Toast: FC<ToastProps> = ({ toastMsg }) => {
  const [status, setStatus] = useState<ToastStatus>(ToastStatus.hidden);
  const [currentMsg, setCurrentMsg] = useState<ToastMessage | undefined>(toastMsg);
  const [nextMsg, setNextMsg] = useState<ToastMessage | undefined>();
  const [currentTimeout, setCurrentTimeout] = useState<any>();

  useEffect(() => {
    return () => {
      clearTimeout(currentTimeout)
    }
  }, [])

  useEffect(() => {
    if (currentMsg !== toastMsg) setNextMsg(toastMsg)
  }, [toastMsg])

  useEffect(() => {
    if (nextMsg) hiding();
  }, [nextMsg])

  useEffect(() => {
    switch (status) {
      case ToastStatus.hidden:
        showing()
    }
  }, [status])

  const showing = () => {
    if (!nextMsg) return;
    setStatus(ToastStatus.showing);
    setCurrentMsg(nextMsg);
    setNextMsg(undefined);

    setCurrentTimeout(setTimeout(show, 500));
  }

  const show = () => {
    setStatus(ToastStatus.visible);
  }

  const hiding = () => {
    setStatus(ToastStatus.hiding)
    setCurrentTimeout(setTimeout(hide, 500));
  }

  const hide = () => {
    setStatus(ToastStatus.hidden);
    setCurrentMsg(undefined);
  }

  if (!currentMsg?.messages || currentMsg.messages.length === 0) {
    return <p className={ `toasty toasty-hidden` }></p>;
  }


  return (
    <p className={ `toasty ${ status } alert alert-${ currentMsg.level }` }>

      { currentMsg.messages.map((message, key) => (
        <span key={ key }>
          { message }<br></br>
        </span>
      )) }

      <button className={ `btn-simple fa fa-times` }
              onClick={ hiding }></button>
    </p>
  );
}
