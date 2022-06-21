import { updateItemAtIndex } from "./utils/array";


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

function createStyleMap<S extends Record<string, any>, T extends ConditionalValues<S, S>>(_: S, cfg: T) {
  return cfg;
}

type ConditionalValueResults<T, U, C extends ConditionalValues<T, U>> = {
  [Key in keyof C]: boolean
}

type DropEmpty<T> =
  { [K in keyof T as keyof T[K] extends never ? never : K]: T[K] };

type DData<T1, T2, C extends ConditionalValues<T1, T2>> = {
  value: T1;
  error: string | null;
  conditionalValues: C[keyof T1]['conditional'] extends Record<string, any> ? ConditionalValueResults<T1, T2, C[keyof T1]['conditional']> : never
}

type FormData<T, C extends ConditionalValues<T, T>> = {
  [Key in keyof T]: T[Key] extends Array<infer I> ?
  DropEmpty<{
    value: T[Key];
    error: string | null;
    conditionalValues: C[Key]['conditional'] extends Record<string, any> ?
    ConditionalValueResults<T, T, C[Key]['conditional']> : never
  }> & { fields: FormData<I, C[Key] extends Record<string, any> ? C[Key]['fields'] : never>[] }
  : T[Key] extends Record<string, any> ?
  DropEmpty<{
    value: T[Key];
    error: string | null;
    conditionalValues: C[Key]['conditional'] extends Record<string, any> ?
    ConditionalValueResults<T, T, C[Key]['conditional']> : never
  }> & { fields: FormData<T[Key], C[Key] extends Record<string, any> ? C[Key]['fields'] : never> }

  : DropEmpty<{
    value: T[Key];
    error: string | null;
    conditionalValues: C[Key]['conditional'] extends Record<string, any> ?
    ConditionalValueResults<T, T, C[Key]['conditional']> : never
  }>
}

const useForm = <T, R extends ConditionalValues<T, T>>(props: { initialValues: T, conditionalValues?: R, validation?: ValidationValues<T> }) => {
  const { initialValues, conditionalValues } = props
  const types = createStyleMap(initialValues, conditionalValues)
  return { values: initialValues, conditions: types }
}

const at = useForm({
  initialValues: {
    name: {
      first: '',
      last: ''
    },
    values: { please: '', work: 4 }
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
    }
  },
  validation: {
    name: {
      validator: (val) => '',
    },
    values: {
    }
  }
})

const v: FormData<typeof at['values'], typeof at['conditions']> = {}

v.values.fields.please.value


