import * as Yup from 'yup'

// RegEx for phone number validation
const phoneRegExp = /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/

const ValidationSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),
  phone: Yup.string()
    .matches(phoneRegExp, "*Phone number is not valid")
    .required("*Phone number required"),
  email: Yup.string()
    .email('Invalid email')
    .required('Required'),
  primary: Yup.string()
    .required('Required'),
  categories: Yup.array()
     .min(1, 'Required'),
  pass: Yup.string(),
  confirmPass: Yup.string()
     .oneOf([Yup.ref('pass'), null], "Passwords don't match!")
     .when('pass', {
       is: (pass) => pass && pass.length > 0,
       then: Yup.string()
         .required('Field is required')
     })
})

export default ValidationSchema
