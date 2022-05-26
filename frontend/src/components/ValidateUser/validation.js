import * as Yup from 'yup'

const ValidationSchema = Yup.object().shape({
 code: Yup.string()
    .matches(/^[0-9]+$/, "Must be only digits")
    .min(6, 'Too Short!')
    .max(9, 'Too Long!')
    .required('Required')
})

export default ValidationSchema
