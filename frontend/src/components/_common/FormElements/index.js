import { Button, Form, InputGroup, Row, Col, Spinner } from 'react-bootstrap'
import './style.scss'

const FormControl = (props) => {
  return (
    <Form.Control
      type={props.type}
      name={props.name}
      as={props.inputAs}
      rows={props.rows}
      placeholder={props.placeholder}
      value={props.value}
      onChange={props.onChange}
      onBlur={props.onBlur}
      isValid={props.isValid}
      className={props.className}
    />
  )
}

export function Submit(props) {
  return (
    <Button
      variant={props.variant ?? 'primary'}
      onClick={props.onClick}
      className={props.className}
      disabled={props.isLoading}
      type={props.onClick ? "button" : "submit" }
    >
      {props.isLoading &&
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />
          <span>&nbsp;Loading...</span>
        </>
      }
      {!props.isLoading &&
        props.value
      }
    </Button>
  )
}

export function Input(props) {
  return (
    <Form.Group
      as={props.as}
      md={props.column}
      controlId={props.controlId}
      className={props.groupClassName}
    >
      {props.InputGroupType ? (
        <InputGroup className={props.InputGroupClassName}>
          {props.InputGroupType === 'text' &&
            <InputGroup.Text id={props.name}>{props.InputGroupValue}</InputGroup.Text>
          }
            { FormControl(props) }
        </InputGroup>
      ): (
        FormControl(props)
      )}
      {props.errors ? (
        <div className="error-message">{props.errors}</div>
      ): null}
      {props.helperText ? (
        <Form.Text className="text-muted">{props.helperText}</Form.Text>
      ): null}
    </Form.Group>
  )
}

export function Check(props) {
  return (
    <Form.Group
      as={props.as}
      md={props.column}
      controlId={props.controlId}
      className={props.groupClassName}
    >
      {props.formLabel &&
        <Form.Label>{props.formLabel}</Form.Label>
      }
      <Row>
        {props.values.map((value, index) => (
          <Col sm={props.checkColumn} className={props.className} key={index}>
            <Form.Check
              inline={props.inline}
              type={props.type}
              id={value.id}
              label={value.label}
              name={props.name}
              value={value.value}
              disabled={value.disabled ?? false}
              checked={props.type === "radio" ?
                props.value === value.value :
                !Array.isArray(props.value) ?
                  value.value :
                  props.value.includes(value.value.toString())
              }
              onChange={props.onChange}
              onBlur={props.onBlur}
              isValid={props.isValid}
            />
          </Col>
        ))}
        {props.errors ? (
          <div className="error-message">{props.errors}</div>
        ): null}
        {props.helperText ? (
          <Form.Text className="text-muted">{props.helperText}</Form.Text>
        ): null}
      </Row>
    </Form.Group>
  )
}
