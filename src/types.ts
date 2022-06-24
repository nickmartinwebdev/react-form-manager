type ActiveFunc<T> = (values: T) => boolean;

export type ConditionalValues<T extends Record<string, any>, U extends Record<string, any>> = { [Key in keyof T]?:
  T[Key] extends Array<infer I> ? I extends Record<string, any> ? {
    conditional?: Partial<Record<string, ActiveFunc<U>>>
  } & { fields?: ConditionalValues<I, U> }
  : { conditional?: Partial<Record<string, ActiveFunc<U>>> }
  : T[Key] extends Record<string, any> ?
  { conditional?: Partial<Record<string, ActiveFunc<U>>> } & { fields?: ConditionalValues<T[Key], U> } :
  { conditional?: Partial<Record<string, ActiveFunc<U>>> }
}

type ValidatorFunc<T> = (values: T) => string | null

export type ValidationValues<T extends Record<string, any>> = { [Key in keyof T]?:
  T[Key] extends Array<infer I> ? I extends Record<string, any> ? {
    validator?: ValidatorFunc<T[Key]>
  } & { fields?: ValidationValues<I> } : {
    validator?: ValidatorFunc<T[Key]>
  } : T[Key] extends Record<string, any> ? {
    validator?: ValidatorFunc<T[Key]>
  } & { fields?: ValidationValues<T[Key]> } :
  { validator?: ValidatorFunc<T[Key]> } }

export type ConditionalValueResults<T, U, C extends ConditionalValues<T, U>> = {
  [Key in keyof C]: boolean
}

type SubmitFunc<TValue> = (value: TValue) => Promise<void>

export type SubmitFuncMap<TState> = { [Key in keyof TState]?: TState[Key] extends Array<infer I> ?
  I extends Record<string, any> ? {
    submit?: SubmitFunc<TState[Key]>
  } & { fields?: SubmitFuncMap<I> } : {
    submit?: SubmitFunc<TState[Key]>
  } :
  TState[Key] extends Record<string, any> ? {
    submit?: SubmitFunc<TState[Key]>
  } & { fields?: SubmitFuncMap<TState[Key]> } : { submit?: SubmitFunc<TState[Key]> } }

export type DropEmpty<T> =
  { [K in keyof T as keyof T[K] extends Function ? K : T[K] extends never ? never : K]: T[K] };

type NonObjectArrayData<T> = {
  value: T;
}

export type FormData<T, C extends ConditionalValues<T, T>, S extends SubmitFuncMap<T>> = {
  [Key in keyof T]: T[Key] extends Array<infer I> ?
  I extends Record<string, any> ?
  {
    value: T[Key];
    error: string | null;
  } & DropEmpty<{
    submit: S[Key] extends { submit: Function } ? () => Promise<SubmitFunc<T[Key]>> : never;
    conditionalValues: C[Key]['conditional'] extends Record<string, any> ?
    ConditionalValueResults<T[Key], T, C[Key]['conditional']> : never
  }> & { items: { fields: FormData<I, C[Key] extends Record<string, any> ? C[Key]['fields'] : never, S[Key] extends Record<string, any> ? S[Key]['fields'] : never> }[] } :
  {
    value: T[Key];
    error: string | null;
  } & DropEmpty<{
    submit: S[Key] extends { submit: Function } ? () => Promise<SubmitFunc<T[Key]>> : never;
    conditionalValues: C[Key]['conditional'] extends Record<string, any> ?
    ConditionalValueResults<T[Key], T, C[Key]['conditional']> : never
  }> & { items: NonObjectArrayData<I>[] }
  : T[Key] extends Record<string, any> ?
  {
    value: T[Key];
    error: string | null;
  } & DropEmpty<{
    submit: S[Key] extends { submit: Function } ? () => Promise<SubmitFunc<T[Key]>> : never;
    conditionalValues: C[Key]['conditional'] extends Record<string, any> ?
    ConditionalValueResults<T[Key], T, C[Key]['conditional']> : never
  }> & {
    fields: FormData<T[Key], C[Key] extends Record<string, any> ?
      C[Key]['fields'] : never, S[Key] extends Record<string, any> ? S[Key]['fields'] : never>
  }
  : {
    value: T[Key];
    error: string | null;
  } & DropEmpty<{
    submit: S[Key] extends { submit: Function } ? () => Promise<SubmitFunc<T[Key]>> : never;
    conditionalValues: C[Key]['conditional'] extends Record<string, any> ?
    ConditionalValueResults<T[Key], T, C[Key]['conditional']> : never
  }>
}


