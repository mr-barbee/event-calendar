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
  primaryContact: Yup.string()
    .required('Required'),
})

export default ValidationSchema
