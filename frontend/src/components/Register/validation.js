import * as Yup from 'yup'

const ValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Required'),
  email: Yup.string()
    .email('Invalid email')
    .required('Required'),
  password: Yup.string()
    .required('Required'),
  confirmPass: Yup.string()
    .required('Required')
})

export default ValidationSchema
