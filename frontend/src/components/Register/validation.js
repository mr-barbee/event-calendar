import * as Yup from 'yup'

export const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .required('Required'),
  email: Yup.string()
    .email('Invalid email')
    .required('Required'),
  fullName: Yup.string()
    .required('Required'),
})
export const PasswordSchema = Yup.object().shape({
  pass: Yup.string()
    .required('Required'),
  confirmPass: Yup.string()
    .required('Required')
})
