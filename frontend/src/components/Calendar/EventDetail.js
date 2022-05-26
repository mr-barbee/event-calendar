import { useState } from 'react'
import { useQuery } from 'react-query'
import { useUser } from '../../hooks/useUser'
import { Formik } from 'formik'
import { Spinner, Button, Modal, Col, Row, Form } from 'react-bootstrap'
import useEventService from '../../api/useEventService'
import ValidationSchema from './validation'

function EventDetail(props) {
  const user = useUser()
  const [show, setShow] = useState(true)
  const [getEvent] = useEventService()
  const { isLoading, data } = useQuery([`get-event-${props.id}`], () => getEvent(props.id))

  const handleClose = () => {
    // Close the modal.
    setShow(false)
    // We want to wait for the
    // modal animation to run.
    setTimeout(function () {
      props.onHide()
    }, 500)
  }

  const formSubmit = values => {
    console.log(values)
    handleClose()
  }

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
            categories: [],
            hours: '',
            note: ''
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
                  <Form.Group
                    controlId="formCategories"
                    as={Col}
                    md="12"
                    className="mb-3"
                  >
                    <Form.Label>
                      <p>The number next to the category depicts how many volunteer spots are still needed</p>
                    </Form.Label>
                    {data.event.categories.map((items) => (
                      <Col sm='3' className="mb-3" key={ items.id }>
                        <Form.Check
                          inline
                          label={ items.category + " (" + items.count + ")" }
                          name="categories"
                          type='checkbox'
                          id={ items.category }
                          value={ items.id }
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </Col>
                    ))}
                    {touched.categories && errors.categories ? (
                      <div className="error-message">{errors.categories}</div>
                    ): null}
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Label><p>How many hours can your volunteer for:</p></Form.Label>
                  <Form.Group
                    as={Col}
                    md="6"
                    controlId="formHours"
                  >
                    <Form.Control
                      type="text"
                      name="hours"
                      placeholder="* Hours Available"
                      value={values.hours}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isValid={touched.hours && !errors.hours}
                      className={touched.hours && errors.hours ? "error" : null}
                    />
                    <Form.Text className="text-muted">
                      <p><strong><sup>Hours will be divided evenly among categories</sup></strong></p>
                    </Form.Text>
                    {touched.hours && errors.hours ? (
                      <div className="error-message">{errors.hours}</div>
                    ): null}
                  </Form.Group>
                </Row>
                <Row>
                  <Form.Group
                    as={Col}
                    md="12"
                    className="mb-3"
                    controlId="formNote"
                  >
                    <Form.Label>Add Note:</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="note"
                      placeholder="Note (Optional)"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.note}
                    />
                  </Form.Group>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                  Close
                </Button>
                <Button variant="primary" type="submit">Volunteer Now</Button>
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
    </Modal>
  )
}

export default EventDetail
