import { useState, useEffect, useCallback, useContext } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useUser } from '../../../hooks/useUser'
import { Formik } from 'formik'
import { Spinner, Modal, Col, Row, Form } from 'react-bootstrap'
import Moment from 'moment'
import { Submit, Input, Check } from '../../_common/FormElements'
import useEventService from '../../../api/useEventService'
import useRemoveVolunteer from '../hooks/useRemoveVolunteer'
import { SessionContext } from '../../../context'
import ValidationSchema from './validation'

function EventDetail(props) {
  const queryClient = useQueryClient()
  const { setPageMessage } = useContext(SessionContext)
  const user = useUser()
  const [error, setError] = useState('')
  const [show, setShow] = useState(true)
  const [getEvent, , updateEvent] = useEventService()
  const [eventMutationLoading, eventData, removeVolunteer] = useRemoveVolunteer()
  const { isLoading, data } = useQuery([`get-event-${props.id}`], () => getEvent(props.id))
  const { isLoading: eventLoading, data: mutationEventData, mutate: mutateEvent } = useMutation((values) => updateEvent(values))
  const eventValid = data ? Moment(data.event.end).isSameOrAfter(new Date(), "day") : true

  const handleClose = useCallback(() => {
    // Close the modal.
    setShow(false)
    // We want to wait for the
    // modal animation to run.
    setTimeout(function () {
      props.onHide()
    }, 500)
  }, [props])

  const formSubmit = values => {
    // Add the id to the values.
    values.id = props.id
    values.remove = false
    // Update the event with
    // the event volunteer data.
    mutateEvent(values, {
      onSuccess: () => {
        // refetch the event data
        queryClient.invalidateQueries([`get-event-${props.id}`])
        queryClient.invalidateQueries(['get-user-events'])
        setPageMessage('Volunteer Status Updated!')
      }
   })
  }

  const remove = useCallback(() => {
    // Close the modal.
    removeVolunteer(props.id)
  }, [props, removeVolunteer])

  useEffect(() => {
    if (mutationEventData || eventData) {
      if (mutationEventData && mutationEventData.errors) {
        setError(mutationEventData.errors[0].message)
      } else if (eventData && eventData.errors)  {
        setError(eventData.errors[0].message)
      }
      else {
        handleClose()
      }
    }
  }, [eventData, mutationEventData, handleClose])

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
      {data && !isLoading &&
        <Formik
          initialValues={{
            categories: data.event.volunteers.length ? data.event.volunteers[0].categories : [],
            hours: data.event.volunteers.length ? data.event.volunteers[0].hours : '',
            note: data.event.volunteers.length && data.event.volunteers[0].note ? data.event.volunteers[0].note : ''
          }}
          enableReinitialize={true}
          validationSchema={ValidationSchema}
          onSubmit={(values, {setSubmitting, resetForm}) => { formSubmit(values) }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">{data.event.title}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Col sm={12}>
                    <p><strong>Username</strong>: {user.name}</p>
                  </Col>
                </Row>
                <Row>
                  <Col sm={12}>
                    <div><p>{ data.event.summary }</p></div>
                    <div className="content" dangerouslySetInnerHTML={{__html: data.event.body}}></div>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col sm={12}><strong>Time:</strong></Col>
                  {data.event.start &&
                    <Col sm={12}>
                      Start: {Moment(data.event.start).format('M/DD/YYYY - h:mma')}
                    </Col>
                  }
                  {data.event.end &&
                    <Col sm={12}>
                      End: {Moment(data.event.end).format('M/DD/YYYY - h:mma')}
                    </Col>
                  }
                </Row>
                <Row>
                  <Col>
                    <p><strong>Volunteer Categories:</strong><br />
                      A list of the volunteer duties that need to be done for the event.<br />
                      Select all that you wish to volunteer for:
                    </p>
                  </Col>
                </Row>
                <Row>
                  <Check
                    as={Col}
                    column="12"
                    type="checkbox"
                    controlId="formCategories"
                    groupClassName="mb-3"
                    helperText={<p>The number next to the category depicts how many volunteer spots are still needed</p>}
                    name="categories"
                    checkColumn="3"
                    inline={true}
                    value={values.categories}
                    values={data.event.categories.map((items) => ({
                      id: items.name,
                      label: items.category + " (" + items.remaining + ")",
                      value: items.id,
                      disabled: items.remaining === '0'
                    }))}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    errors={touched.categories && errors.categories ? errors.categories : null}
                  />
                </Row>
                <Row>
                  <Input
                    as={Col}
                    column="6"
                    controlId="formHours"
                    groupClassName="mb-3"
                    type="text"
                    name="hours"
                    placeholder="* Hours Available"
                    formLabel={<p>How many hours can your volunteer for:</p>}
                    value={values.hours}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isValid={touched.hours && !errors.hours}
                    className={touched.hours && errors.hours ? "error" : null}
                    errors={touched.hours && errors.hours ? errors.hours : null}
                    helperText={<p><strong><sup>Hours will be divided evenly among categories</sup></strong></p>}
                  />
                </Row>
                <Row>
                  <Input
                    as={Col}
                    column="12"
                    controlId="formNote"
                    groupClassName="mb-3"
                    inputAs="textarea"
                    name="note"
                    rows={3}
                    formLabel="Add Note:"
                    placeholder="Note (Optional)"
                    value={values.note}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Row>
              </Modal.Body>
              <Modal.Footer>
                {data.event.volunteers.length > 0 && eventValid &&
                  <Submit variant="secondary" onClick={remove} value="Remove Volunteer" isLoading={eventMutationLoading}/>
                }
                <Submit variant="secondary" onClick={handleClose} value="Close" />
                {eventValid &&
                  <Submit value="Volunteer Now" isLoading={eventLoading} />
                }
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      }
      {isLoading &&
        <Spinner animation="border" role="status" size="lg" >
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      }
      {error &&
        <p>{ error }</p>
      }
    </Modal>
  )
}

export default EventDetail
