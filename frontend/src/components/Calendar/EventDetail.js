import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useUser } from '../../hooks/useUser'
import { Formik } from 'formik'
import { Spinner, Modal, Col, Row, Form, Button } from 'react-bootstrap'
import { Submit, Input, Check  } from '../_common/FormElements'
import useEventService from '../../api/useEventService'
import ValidationSchema from './validation'

function EventDetail(props) {
  const queryClient = useQueryClient()
  const user = useUser()
  const [error, setError] = useState('')
  const [show, setShow] = useState(true)
  const [getEvent, , updateEvent] = useEventService()
  const { isLoading, data } = useQuery([`get-event-${props.id}`], () => getEvent(props.id))
  const { data: mutationEventData, mutate: mutateEvent } = useMutation((values) => updateEvent(values))

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
      }
   })
  }

  const removeVolunteer = () => {
    // Add the id to the values.
    const values = {
      id: props.id,
      categories:[],
      hours:0,
      note:'',
      remove: true
    }
    // Update the event with
    // the event volunteer data.
    mutateEvent(values, {
      onSuccess: () => {
        // refetch the event data
        queryClient.invalidateQueries([`get-event-${props.id}`])
      }
   })
  }

  useEffect(() => {
    if (mutationEventData) {
      if (mutationEventData.errors) {
        setError(mutationEventData.errors[0].message)
      } else {
        handleClose()
      }
    }
  }, [mutationEventData, handleClose])

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
                    <div className="content" dangerouslySetInnerHTML={{__html: data.event.body}}></div>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p>A list of the volunteer duties that need to be done for the event.<br />
                      Select all that you wish to volunteer for:</p>
                  </Col>
                </Row>
                <Row>
                  <Check
                    as={Col}
                    column="12"
                    type="checkbox"
                    controlId="formCategories"
                    groupClassName="mb-3"
                    formLabel={<p>The number next to the category depicts how many volunteer spots are still needed</p>}
                    name="categories"
                    checkColumn="3"
                    inline={true}
                    value={values.categories}
                    values={data.event.categories.map((items) => (
                      {id:items.name, label:items.category + " (" + items.remaining + ")", value:items.id}
                    ))}
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
                {data.event.volunteers.length > 0 &&
                  <Button variant="secondary" onClick={removeVolunteer}>Remove Volunteer</Button>
                }
                <Submit variant="secondary" onClick={handleClose} value="Close" />
                <Submit value="Volunteer Now" />
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
