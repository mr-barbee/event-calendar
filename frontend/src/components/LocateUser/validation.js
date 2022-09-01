import * as Yup from 'yup'

// RegEx for phone number validation
const phoneRegExp = /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/

const ValidationSchema = Yup.object().shape({
  phone: Yup.string()
    .matches(phoneRegExp, "*Phone number is not valid")
    .when('name', {
      is: (name) => !name || name.length === 0,
      then: Yup.string()
        .required('Field is required'),
      otherwise: Yup.string()
    }),
  name: Yup.string()
    .when('phone', {
      is: (phone) => !phone || phone.length === 0,
      then: Yup.string()
        .required('Field is required'),
      otherwise: Yup.string()
    })
}, [['phone', 'name']])

export default ValidationSchema
