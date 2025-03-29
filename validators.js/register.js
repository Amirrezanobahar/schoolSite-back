import validator from 'fastest-validator'

const v = new validator()

const schema = {
    name: { type: 'string', required: true, min: 3, max: 25 },
    email: { type: 'email', required: true },
    phone: { type: 'string', required: true},
    age: { type: 'string', required: true },
    password: { type: 'string', required: true, min: 8, max: 18 },
    confirmPassword: { type: 'equal', field: 'password', required: true },
}

export const valid = v.compile(schema)