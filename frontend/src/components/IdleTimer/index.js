import { useEffect, useState, useContext } from 'react'
import { useMutation, useQuery } from 'react-query'
import { useIdleTimer } from 'react-idle-timer'
import { Modal, Row, Col } from 'react-bootstrap'
import { Submit } from '../_common/FormElements'
import { SessionContext } from '../../context'
import useLogout from '../../hooks/useLogout'
import useUserService from '../../api/useUserService'

export default function IdleTimer(props) {
  const { token, refetchSession, setPageMessage } = useContext(SessionContext)
  const [logout] = useLogout()
  const [,,, logoutUser,,,,,,,, verifySession] = useUserService()
  // Login mutation for the login form with an email and password.
  const { isError, error, mutate: userLogout } = useMutation((values) => logoutUser(values), { onSuccess: () => logout() })
  // We want to verify that the user still has a valid user session after 30 mins.
  const { isLoading: verifyLoading, data: verify } = useQuery(['verify-session'], () => verifySession(), {
    staleTime: 1800000, refetchOnWindowFocus: true
  })
  if (isError) console.log(error)
  // Set timeout values
  const timeout = 1000 * 60 * 30
  const promptTimeout = 1000 * 30
  // Modal open state
  const [open, setOpen] = useState(false)
  // Time before idle
  const [remaining, setRemaining] = useState(0)

  const onPrompt = () => {
    // onPrompt will be called after the timeout value is reached
    // In this case 30 minutes. Here you can open your prompt.
    // All events are disabled while the prompt is active.
    // If the user wishes to stay active, call the `reset()` method.
    // You can get the remaining prompt time with the `getRemainingTime()` method,
    setOpen(true)
    setRemaining(promptTimeout)
  }

  const onIdle = () => {
    // onIdle will be called after the promptTimeout is reached.
    // In this case 30 seconds. Here you can close your prompt and
    // perform what ever idle action you want such as log out your user.
    // Events will be rebound as long as `stopOnMount` is not set.
    userLogout({'logoutToken': token.logout_token})
    setPageMessage('Your session has timed out!')
    setOpen(false)
    setRemaining(0)
  }

  const onActive = () => {
    // onActive will only be called if `reset()` is called while `isPrompted()`
    // is true. Here you will also want to close your modal and perform
    // any active actions.
    setOpen(false)
    setRemaining(0)
  }

  const { getRemainingTime, isPrompted, activate } = useIdleTimer({
    timeout,
    promptTimeout,
    onPrompt,
    onIdle,
    onActive
  })

  const handleStillHere = () => {
    refetchSession()
    setOpen(false)
    activate()
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPrompted()) {
        setRemaining(Math.ceil(getRemainingTime() / 1000))
      }
    }, 1000)
    return () => {
      clearInterval(interval)
    }
  }, [getRemainingTime, isPrompted])

  useEffect(() => {
    // This means the user is no longer logged in so log them out.
    if (!verifyLoading && verify && verify.is_authenticated === false) {
      logout()
      setPageMessage('Your session has timed out!')
      setRemaining(0)
    }
  }, [verify, verifyLoading, setRemaining, logout, setPageMessage])

  return (
    <Modal
      {...props}
      show={open}
      backdrop="static"
      keyboard={false}
      size="sm"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Logging Out...</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col sm={12}>
            <p>Logging you out in {remaining} seconds</p>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Submit onClick={handleStillHere} value="I'm Still Here" />
      </Modal.Footer>
    </Modal>
  )
}
