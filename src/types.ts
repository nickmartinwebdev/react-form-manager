type ActiveFunc<T, U, R> = (value: T, values: U) => R;

type TestFunc<T extends any, R extends any> = (value: T) => R;

const a = {
  hey: () => (value: string) => "no",
  bye: () => (value: number) => "yes",
};

type FuncMap<T, F extends Function> = { [Key in keyof T]: F };

const createFuncMap = <T, F extends Function>(state: T, map: FuncMap<T, F>) => {
  return map;
};

type MapFuncMap<T, R> = {
  [Key in keyof T]: Record<string, ActiveFunc<T[Key], T, R>>;
};

const cMap = <T, R, C extends MapFuncMap<T, R>>(state: T, map: C) => {
  return map;
};

type Results<T, U, R, C extends Record<string, ActiveFunc<T, U, R>>> = {
  [Key in keyof C]: ReturnType<C[Key]>;
};

const d = cMap(
  { name: { first: "" } },
  {
    name: {
      one: (val) => val.first,
    },
  }
);

export type ConditionalValues<
  T extends Record<string, any>,
  U extends Record<string, any>,
  R
> = {
  [Key in keyof T]?: T[Key] extends Array<infer I>
    ? I extends Record<string, any>
      ? {
          conditional?: Partial<Record<string, ActiveFunc<T[Key], U, R>>>;
        } & { fields?: ConditionalValues<I, U, R> }
      : { conditional?: Partial<Record<string, ActiveFunc<T[Key], U, R>>> }
    : T[Key] extends Record<string, any>
    ? { conditional?: Partial<Record<string, ActiveFunc<T[Key], U, R>>> } & {
        fields?: ConditionalValues<T[Key], U, R>;
      }
    : { conditional?: Partial<Record<string, ActiveFunc<T[Key], U, R>>> };
};

type ValidatorFunc<T> = (values: T) => string | null;

export type ValidationValues<T extends Record<string, any>> = {
  [Key in keyof T]?: T[Key] extends Array<infer I>
    ? I extends Record<string, any>
      ? {
          validator?: ValidatorFunc<T[Key]>;
        } & { fields?: ValidationValues<I> }
      : {
          validator?: ValidatorFunc<T[Key]>;
        }
    : T[Key] extends Record<string, any>
    ? {
        validator?: ValidatorFunc<T[Key]>;
      } & { fields?: ValidationValues<T[Key]> }
    : { validator?: ValidatorFunc<T[Key]> };
};

export type ConditionalValueResults<
  T,
  U,
  R,
  C extends ConditionalValues<T, U, R>[keyof ConditionalValues<
    T,
    U,
    R
  >]["conditional"]
> = {
  [Key in keyof C]: ReturnType<C[Key]>;
};

type SubmitFunc<TValue> = (value: TValue) => Promise<void>;

export type SubmitFuncMap<TState> = {
  [Key in keyof TState]?: TState[Key] extends Array<infer I>
    ? I extends Record<string, any>
      ? {
          submit?: SubmitFunc<TState[Key]>;
        } & { fields?: SubmitFuncMap<I> }
      : {
          submit?: SubmitFunc<TState[Key]>;
        }
    : TState[Key] extends Record<string, any>
    ? {
        submit?: SubmitFunc<TState[Key]>;
      } & { fields?: SubmitFuncMap<TState[Key]> }
    : { submit?: SubmitFunc<TState[Key]> };
};

export type DropEmpty<T> = {
  [K in keyof T as keyof T[K] extends never ? never : K]: T[K];
};

export type DropEmptyFunction<T> = {
  [K in keyof T as keyof T[K] extends Function ? K : never]: T[K];
};

type A = DropEmpty<{ values: {} }>;

type NonObjectArrayData<T> = {
  value: T;
};

export type FormData<
  T,
  R,
  C extends ConditionalValues<T, T, R>,
  S extends SubmitFuncMap<T>
> = {
  [Key in keyof T]: T[Key] extends Array<infer I>
    ? I extends Record<string, any>
      ? {
          value: T[Key];
          error: string | null;
        } & DropEmpty<{
          conditionalValues: C[Key]["conditional"] extends Record<string, any>
            ? ConditionalValueResults<T[Key], T, R, C[Key]["conditional"]>
            : never;
        }> &
          DropEmptyFunction<{
            submit: S[Key] extends { submit: Function }
              ? () => Promise<SubmitFunc<T[Key]>>
              : never;
          }> & {
            items: {
              fields: FormData<
                I,
                R,
                C[Key] extends Record<string, any> ? C[Key]["fields"] : never,
                S[Key] extends Record<string, any> ? S[Key]["fields"] : never
              >;
            }[];
          }
      : {
          value: T[Key];
          error: string | null;
        } & DropEmpty<{
          conditionalValues: C[Key]["conditional"] extends Record<string, any>
            ? ConditionalValueResults<T[Key], T, R, C[Key]["conditional"]>
            : never;
        }> &
          DropEmptyFunction<{
            submit: S[Key] extends { submit: Function }
              ? () => Promise<SubmitFunc<T[Key]>>
              : never;
          }> & { items: NonObjectArrayData<I>[] }
    : T[Key] extends Record<string, any>
    ? {
        value: T[Key];
        error: string | null;
      } & DropEmpty<{
        conditionalValues: C[Key]["conditional"] extends Record<string, any>
          ? ConditionalValueResults<T[Key], T, R, C[Key]["conditional"]>
          : never;
      }> &
        DropEmptyFunction<{
          submit: S[Key] extends { submit: Function }
            ? () => Promise<SubmitFunc<T[Key]>>
            : never;
        }> & {
          fields: FormData<
            T[Key],
            R,
            C[Key] extends Record<string, any> ? C[Key]["fields"] : never,
            S[Key] extends Record<string, any> ? S[Key]["fields"] : never
          >;
        }
    : {
        value: T[Key];
        error: string | null;
      } & DropEmpty<{
        conditionalValues: C[Key]["conditional"] extends Record<string, any>
          ? ConditionalValueResults<T[Key], T, R, C[Key]["conditional"]>
          : never;
      }> &
        DropEmptyFunction<{
          submit: S[Key] extends { submit: Function }
            ? () => Promise<SubmitFunc<T[Key]>>
            : never;
        }>;
};
