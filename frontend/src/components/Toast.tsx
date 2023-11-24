import { Component, Fragment } from 'react';

// String constants matching css rules
const TOAST_STATUSES: any = {
  HIDDEN: 'toasty-hidden',
  SHOWING: 'toasty-showing',
  VISIBLE: 'toasty-visible',
  HIDING: 'toasty-hiding',
};

// TODO backend error messages must be more consistent
// There is only one case when a sub "error_lines" property is returned
// Perhaps always return an array of string as messages?
// Ot just an error code and additional metadata as json
export type ToastMsg = {
  msg: any, // TODO: string | { error_lines: string[] },
  lvl: string,
};

type ToastProps = {
  toastMsg?: ToastMsg,
};

type ToastState = {
  status: string,
  currentMsg?: ToastMsg,
  nextMsg?: ToastMsg,
};

class Toast extends Component<ToastProps, ToastState> {

  currentTimeout: any;

  constructor(props: ToastProps) {
    super(props);

    this.state = {
      status: TOAST_STATUSES.HIDDEN,
      currentMsg: props.toastMsg,
      nextMsg: undefined,
    };
  }

  componentDidUpdate(prevProps: ToastProps) {
    if (prevProps.toastMsg !== this.props.toastMsg) {
      this.setState({
        nextMsg: this.props.toastMsg,
      }, this.hiding);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.currentTimeout);
  }

  showing = () => {
    if (this.state.nextMsg) {
      this.setState({
        status: TOAST_STATUSES.SHOWING,
        currentMsg: this.state.nextMsg,
        nextMsg: undefined,
      });

      this.currentTimeout = setTimeout(this.show, 500);
    }
  }

  show = () => {
    this.setState({
      status: TOAST_STATUSES.VISIBLE,
    });
  }

  hiding = () => {
    this.setState({
      status: TOAST_STATUSES.HIDING,
    });

    this.currentTimeout = setTimeout(this.hide, 500);
  }

  hide = () => {
    this.setState({
      status: TOAST_STATUSES.HIDDEN,
      currentMsg: undefined,
    }, this.showing);
  }

  render() {
    if (this.state.currentMsg && this.state.currentMsg.msg !== "") {
      const tst: ToastMsg = this.state.currentMsg;
      let errorMessage
      if (tst.msg.hasOwnProperty('error_lines')) {
        errorMessage = tst.msg.error_lines.map((item: string, index: number) => { return (<span key={index.toFixed()}>{item}<br></br></span>) })
        errorMessage = <Fragment>{errorMessage}</Fragment>
      } else {
        errorMessage = tst.msg
      }

      return (
        <p className={`toasty ${this.state.status} alert alert-${tst.lvl}`}>
          {errorMessage}
          <button
            className={`btn-simple fa fa-times`}
            onClick={this.hiding}
          ></button>
        </p>
      );
    } else {
      return <p className={`toasty toasty-hidden`}></p>;
    }
  }
}

export default Toast;
