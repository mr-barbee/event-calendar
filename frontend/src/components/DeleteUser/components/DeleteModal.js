import { useState, useCallback, useContext } from 'react'
import { Modal, Row, Col } from 'react-bootstrap'
import { useMutation } from 'react-query'
import useUserService from '../../../api/useUserService'
import { Submit } from '../../_common/FormElements'
import useLogout from '../../../hooks/useLogout'
import { SessionContext } from '../../../context'

export default function DeleteModal(props) {
  const [show, setShow] = useState(true)
  const [logout] = useLogout()
  const { setPageMessage } = useContext(SessionContext)
  const [,,,,,,,,, cancelUser] = useUserService()
  const { mutate: cancel } = useMutation(() => cancelUser(), {
    onSuccess: () => { logoutHandler() }
  })

  const logoutHandler = () => {
    setPageMessage('You account has been deactivated! To reactivate please contact site administator.')
    logout()
  }

  const handleClose = useCallback(() => {
    // Close the modal.
    setShow(false)
    // We want to wait for the
    // modal animation to run.
    setTimeout(function () {
      props.onHide()
    }, 500)
  }, [props])

  return (
    <Modal
      {...props}
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Cancel Account</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col sm={12}>
            Are you sure you want to cancel your account?
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Submit variant="secondary" onClick={handleClose} value="No" />
        <Submit onClick={() => { cancel() }} value="Yes" />
      </Modal.Footer>
    </Modal>
  )
}
