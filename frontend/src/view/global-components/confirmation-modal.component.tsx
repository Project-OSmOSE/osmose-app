import { Modal, Button } from "react-bootstrap"
import { confirmable, createConfirmation } from "react-confirm";

type ConfirmationProps = {
  okLabel?: string,
  cancelLabel?: string,
  title?: string,
  confirmation: string,
  show?: boolean,
  proceed?: any,     // called when ok button is clicked.
  enableEscape?: boolean,
}

const ConfirmationModal = ({
                             okLabel = "OK",
                             cancelLabel = "Cancel",
                             title = "Confirmation",
                             confirmation,
                             show,
                             proceed,
                             enableEscape = true,
                           }: ConfirmationProps) => {
  return (
    <div className="static-modal">
      <Modal animation={ false } show={ show } onHide={ () => proceed(false) }
             backdrop={ enableEscape ? true : "static" } keyboard={ enableEscape }>
        <Modal.Header closeButton>
          <Modal.Title>{ title }</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          { confirmation }
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-danger" variant="danger" onClick={ () => proceed(false) }>{ cancelLabel }</Button>
          <Button className="ml-2 btn-success" onClick={ () => proceed(true) }>{ okLabel }</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export function confirm(confirmation: string, okLabel: string) {
  return createConfirmation(confirmable(ConfirmationModal))({ confirmation, okLabel });
}
