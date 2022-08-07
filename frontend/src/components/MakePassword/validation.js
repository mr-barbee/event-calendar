import * as Yup from 'yup'

export const PasswordSchema = Yup.object().shape({
  pass: Yup.string()
    .required('Required'),
  confirmPass: Yup.string()
    .oneOf([Yup.ref('pass'), null], "Passwords don't match!")
    .when('pass', {
     is: (pass) => pass && pass.length > 0,
     then: Yup.string()
       .required('Field is required')
    })
})
