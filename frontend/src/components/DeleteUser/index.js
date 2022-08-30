import { Row, Col } from 'react-bootstrap'
import { useState } from 'react'
import { Submit } from '../_common/FormElements'
import DeleteModal from './components/DeleteModal'
import SEO from '@americanexpress/react-seo'

function DeleteUser() {
  const [openList, setOpenList] = useState(false)

  return (
    <div className="delete-user">
      <SEO
        title="Delete Account"
        description="User can disable their accounts and disable all their content."
      />
      {openList &&
        <DeleteModal
          onHide={() => setOpenList(false)}
        />
      }
      <Row>
        <Col sm={12}>
          <p>This will disable your account and prevent all notifications and emails to be sent to out.</p>
          <p>If you want to fully delete your account please contact site administrator.</p>
        </Col>
        <Col sm={12}>
          <Submit onClick={() => setOpenList(true)} value='Cancel Account' />
        </Col>
      </Row>
    </div>
  )
}

export default DeleteUser
