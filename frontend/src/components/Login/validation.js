import * as Yup from 'yup'

const ValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Required'),
  password: Yup.string()
    .required('Required')
})

export default ValidationSchema
