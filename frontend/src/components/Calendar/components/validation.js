import * as Yup from 'yup'

const ValidationSchema = Yup.object().shape({
 categories: Yup.array()
    .min(1, 'Required'),
  hours: Yup.number()
    .typeError('hours must specify a number')
    .min(0, 'Min value 0.')
    .max(30, 'Max value 30.')
    .required('Required'),
})

export default ValidationSchema
