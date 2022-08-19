import * as Yup from 'yup'

const ValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .when('name', {
      is: (name) => !name || name.length === 0,
      then: Yup.string()
        .required('Field is required'),
      otherwise: Yup.string()
    }),
  name: Yup.string()
    .when('email', {
      is: (email) => !email || email.length === 0,
      then: Yup.string()
        .required('Field is required'),
      otherwise: Yup.string()
    })
}, [['email', 'name']])

export default ValidationSchema
