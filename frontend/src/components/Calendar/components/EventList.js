import { useState, useEffect, useCallback } from 'react'
import { Modal, Table, Row, Col, Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import Moment from 'moment'
import { useUser } from '../../../hooks/useUser'
import useEventService from '../../../api/useEventService'
import useRemoveVolunteer from '../hooks/useRemoveVolunteer'
import Spinner from '../../_common/Spinner'

function EventList(props) {
  const [show, setShow] = useState(true)
  const [error, setError] = useState('')
  const user = useUser()
  const [, getEvents] = useEventService()
  const [, removeVolunteer] = useRemoveVolunteer()
  const { isLoading: eventsLoading, data } = useQuery(['get-user-events'], () => getEvents({
    'limit': 10, 'offset': 0, 'date':'01-05-2022', 'range': '12 month', 'user': user.uid
  }))

  const handleClose = useCallback(() => {
    // Close the modal.
    setShow(false)
    // We want to wait for the
    // modal animation to run.
    setTimeout(function () {
      props.onHide()
    }, 500)
  }, [props])

  const remove = id => {
    removeVolunteer(id)
  }

  useEffect(() => {
    if (data && data.errors) {
      // If errors are returned then set it.
      setError(data.errors[0].message)
    }
  }, [data])

  return(
    <Modal
      show={show}
      onHide={handleClose}
      dialogClassName="modal-90w"
      size="lg"
      aria-labelledby="example-custom-modal-styling-title"
      centered
    >
      {data && !eventsLoading &&
        <>
          <Modal.Header closeButton>
            <Modal.Title id="example-custom-modal-styling-title">
              Your Event List
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <Table striped bordered hover size="lg">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Operations</th>
              </tr>
            </thead>
            <tbody>
              {data.events.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.title}</td>
                  <td>
                    {item.start &&
                      Moment(item.start).format('M/DD/YYYY - h:mma')
                    }
                  </td>
                  <td>
                    <Container>
                      <Row>
                        <Col sm="6"><Link to={`/event-calendar/${item.id}`}>Edit</Link></Col>
                        <Col sm="6"><Link to={'/event-calendar'} onClick={() => remove(item.id)}>Remove</Link></Col>
                      </Row>
                    </Container>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        </>
      }
      {eventsLoading &&
        <Spinner />
      }
      {error &&
        <p>{ error }</p>
      }
    </Modal>
  )
}

export default EventList
