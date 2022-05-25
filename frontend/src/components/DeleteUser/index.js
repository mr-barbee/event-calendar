import { Button, Form, Row } from 'react-bootstrap'

function DeleteUser() {

  function handleSubmit() {
    console.log('in')
  }

  return (
    <div className="delete-user">
      <Form onSubmit={handleSubmit}>
        <Row>
          <Button variant="primary" type="submit">Delete User</Button>
        </Row>
      </Form>
    </div>
  )
}

export default DeleteUser
