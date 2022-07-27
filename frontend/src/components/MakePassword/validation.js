import * as Yup from 'yup'

export const PasswordSchema = Yup.object().shape({
  pass: Yup.string()
    .required('Required'),
  confirmPass: Yup.string()
    .required('Required')
})
