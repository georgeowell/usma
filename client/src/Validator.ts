export interface FieldValidation {
  validate: (stringValue: string) => boolean
  error: string
}

export interface Field {
  defaultValue: any
  stringValue: string
  value: any
  valid: boolean
  error: string | null
  validation: FieldValidation[]
  parse: (stringValue: string) => any
}

export interface Form {
  valid: boolean 
  fields: {[key: string]: Field}
}

export class Validator {
  static field(defaultValue: any, parse: (stringValue: string) => any, validation: FieldValidation[]): Field {
    return { stringValue: ''
           , defaultValue
           , value: defaultValue
           , validation
           , parse
           , valid: true
           , error: null
           }
  }
  
  static resetField(field: Field): Field {
    return { stringValue: ''
           , value: field.defaultValue
           , defaultValue: field.defaultValue
           , validation: field.validation
           , parse: field.parse
           , valid: true
           , error: null
           }
  }
  
  static validateField(field: Field): Field {
    let error = null
    let valid = true
    for(let v of field.validation) {
      if(!v.validate(field.stringValue)) {
        valid = false
        error = v.error
        break
      }
    }

    return { stringValue: field.stringValue
           , value: field.value
           , defaultValue: field.defaultValue
           , validation: field.validation
           , parse: field.parse
           , valid
           , error
           }
  }

  static updateField(field: Field, stringValue: string): Field {
    let error = null
    let valid = true
    for(const v of field.validation) {
      if(!v.validate(stringValue)) {
        valid = false
        error = v.error
        break
      }
    }

    const value = field.parse(stringValue)

    return { stringValue
           , value: value
           , defaultValue: field.defaultValue
           , validation: field.validation
           , parse: field.parse
           , valid
           , error
           }
  }

  static form(fields: {[key: string]: Field}): Form {
    return { valid: true
           , fields: fields
           }
  }

  static reset(form: Form): Form {
    const fields: {[key: string]: Field} = {}
    for(let f in form.fields) {
      fields[f] = this.resetField(form.fields[f])
    }

    return { valid: true
           , fields
           }
  }

  static validate(form: Form): Form {
    const fields: {[key: string]: Field} = {}
    let valid = true
    
    for(let f in form.fields) {
      const field = this.validateField(form.fields[f])
      valid = valid && field.valid
      fields[f] = field
    }

    return { valid
           , fields
           }
  }

  static update(form: Form, fieldName: string, stringValue: string) {
    const fields: {[key: string]: Field} = {}
    let valid = true
    
    for(let f in form.fields) {
      console.log(f)
      if(f == fieldName) {
        const field = this.updateField(form.fields[f], stringValue)
        console.log(field.valid)
        valid = valid && field.valid
        fields[f] = field
      } else {
        let field = this.validateField(form.fields[f])
        console.log(field.valid)
        valid = valid && field.valid
        fields[f] = field
      }
    }

    console.log('done')
    console.log(stringValue)
    console.log(valid)

    return { valid
           , fields
           }
    
  }
}