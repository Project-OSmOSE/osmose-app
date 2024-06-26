import { FC, useEffect, useState } from 'react';
import { ToastMessage } from "@/types/toast.ts";

// String enum matching css rules
enum ToastStatus {
  hidden = 'toasty-hidden',
  showing = 'toasty-showing',
  visible = 'toasty-visible',
  hiding = 'toasty-hiding',
}

type ToastProps = {
  toastMessage?: ToastMessage,
};

export const Toast: FC<ToastProps> = ({ toastMessage }) => {
  const [status, setStatus] = useState<ToastStatus>(ToastStatus.hidden);
  const [currentMsg, setCurrentMsg] = useState<ToastMessage | undefined>(toastMessage);
  const [nextMsg, setNextMsg] = useState<ToastMessage | undefined>();
  const [currentTimeout, setCurrentTimeout] = useState<any>();

  useEffect(() => {
    return () => {
      clearTimeout(currentTimeout)
    }
  }, [])

  useEffect(() => {
    if (currentMsg !== toastMessage) setNextMsg(toastMessage)
  }, [toastMessage])

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
