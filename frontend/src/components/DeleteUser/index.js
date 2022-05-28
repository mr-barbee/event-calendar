import { Form, Row } from 'react-bootstrap'
import { Submit } from '../_common/FormElements'

function DeleteUser() {

  function handleSubmit() {
    console.log('in')
  }

  return (
    <div className="delete-user">
      <Form onSubmit={handleSubmit}>
        <Row>
          <Submit value='Delete User' />
        </Row>
      </Form>
    </div>
  )
}

export default DeleteUser
