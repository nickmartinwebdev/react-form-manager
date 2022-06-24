
type ActiveFunc<T> = (values: T) => boolean;

type ConditionalValues<T extends Record<string, any>, U extends Record<string, any>> = { [Key in keyof T]?:
  T[Key] extends Array<infer I> ? I extends Record<string, any> ? {
    conditional?: Partial<Record<string, ActiveFunc<T>>>
  } & { fields?: ConditionalValues<I, T> }
  : { conditional?: Partial<Record<string, ActiveFunc<T>>> }
  : T[Key] extends Record<string, any> ?
  { conditional?: Partial<Record<string, ActiveFunc<T>>> } & { fields?: ConditionalValues<T[Key], T> } :
  { conditional?: Partial<Record<string, ActiveFunc<T>>> }
}

type ValidatorFunc<T> = (values: T) => string | null

type ValidationValues<T extends Record<string, any>> = { [Key in keyof T]?:
  T[Key] extends Array<infer I> ? I extends Record<string, any> ? {
    validator?: ValidatorFunc<T[Key]>
  } & { fields?: ValidationValues<I> } : {
    validator?: ValidatorFunc<T[Key]>
  } : T[Key] extends Record<string, any> ? {
    validator?: ValidatorFunc<T[Key]>
  } & { fields?: ValidationValues<T[Key]> } :
  { validator?: ValidatorFunc<T[Key]> } }

type ConditionalValueResults<T, U, C extends ConditionalValues<T, U>> = {
  [Key in keyof C]: boolean
}

type SubmitFunc<TValue> = (value : TValue) =>  Promise<void>

type SubmitFuncMap<TState> = {[Key in keyof TState] ?: TState[Key] extends Array<infer I> ? 
  I extends Record<string, any> ? {
    submit ?: SubmitFunc<TState[Key]>
  } & {fields? : SubmitFuncMap<I>}: {
    submit ?: SubmitFunc<TState[Key]>
  } :
  TState[Key] extends Record<string, any> ? {
  submit ?: SubmitFunc<TState[Key]>
} & {fields?: SubmitFuncMap<TState[Key]>} : {submit?: SubmitFunc<TState[Key]>}}

type DropEmpty<T> =
  { [K in keyof T as keyof T[K] extends Function ? K : T[K] extends never ? never : K  ]: T[K] };



type NonObjectArrayData<T> = {
  value: T;
}

type FormData<T, C extends ConditionalValues<T, T>, S extends SubmitFuncMap<T>> = {
  [Key in keyof T]: T[Key] extends Array<infer I> ?
  I extends Record<string, any> ?
  DropEmpty<{
    value: T[Key];
    error: string | null;
    submit: S[Key] extends {submit: Function } ? () => Promise<SubmitFunc<T[Key]>> : never;
    conditionalValues: C[Key]['conditional'] extends Record<string, any> ?
    ConditionalValueResults<T, T, C[Key]['conditional']> : never
  }> & { items: { fields: FormData<I, C[Key] extends Record<string, any> ? C[Key]['fields'] : never, S[Key] extends Record<'fields' | 'submit', any> ? S[Key]['fields']: never> }[] } :
  DropEmpty<{
    value: T[Key];
    error: string | null;
    submit: S[Key] extends {submit: Function } ? () => Promise<SubmitFunc<T[Key]>> : never;
    conditionalValues: C[Key]['conditional'] extends Record<string, any> ?
    ConditionalValueResults<T, T, C[Key]['conditional']> : never
  }> & { items: NonObjectArrayData<I>[] }
  : T[Key] extends Record<string, any> ?
  DropEmpty<{
    value: T[Key];
    error: string | null;
    submit: S[Key] extends {submit: Function } ? () => Promise<SubmitFunc<T[Key]>> : never;
    conditionalValues: C[Key]['conditional'] extends Record<string, any> ?
    ConditionalValueResults<T, T, C[Key]['conditional']> : never
  }> & { fields: FormData<T[Key], C[Key] extends Record<string, any> ? C[Key]['fields'] : never, S[Key] extends Record<'fields' | 'submit', any> ? S[Key]['fields']: never>  }
  : DropEmpty<{
    value: T[Key];
    error: string | null;
    submit: S[Key] extends {submit: Function } ? () => Promise<SubmitFunc<T[Key]>> : never;
    conditionalValues: C[Key]['conditional'] extends Record<string, any> ?
    ConditionalValueResults<T, T, C[Key]['conditional']> : never
  }>
}

export const useForm = <T, R extends ConditionalValues<T, T>, S extends SubmitFuncMap<T>>(props: { initialValues: T, conditionalValues?: R, validation?: ValidationValues<T>, submit?: S }) => {
  const { initialValues, conditionalValues, submit } = props
  return { values: initialValues, conditions: conditionalValues, submit }
}

const at = useForm({
  initialValues: {
    hey: '',
        name: {
      first: '',
      last: ''
    },
    values: [{text: ''}]
  },
  conditionalValues: {
    name: {
      conditional: {
        4: () => true
      },
      fields: {
        first: {
          conditional: {
            test: (a) => false
          }
        }
      }
    },
    values: {
      conditional:{
        
      },
      fields: {
        text: {
          conditional: {
            tyr: () => true
          }
        }
      }
    },
    hey: {
      conditional: {
        hi : () => true
      }
    }
  },
  validation: {
    name: {
      validator: (val) => '',
    },
    values: {
      validator: () => 'true'
    }
  },
  submit: {
    name: {
      submit: async (value) => {}
    },
    values: {
      submit: async (hey) => {},
      fields: {
        text: {

        }
      }
    },


  }
})

const v: FormData<typeof at['values'], typeof at['conditions'], typeof at['submit']> = {}

v.hey.


