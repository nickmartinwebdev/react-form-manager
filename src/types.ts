export type ComputedValueFunc<T, U, R> = (value: T, values: U) => R;

export type ComputedValuesRecord<T, U, R> = Partial<
  Record<string, ComputedValueFunc<T, U, R>>
>;

export type ComputedValues<
  T extends Record<string, any>,
  U extends Record<string, any>,
  R
  > = {
    [Key in keyof T]?: T[Key] extends Array<infer I>
    ? I extends Record<string, any>
    ? {
      computed?: ComputedValuesRecord<T[Key], U, R>;
    } & { fields?: ComputedValues<I, U, R> }
    : { computed?: ComputedValuesRecord<T[Key], U, R> }
    : T[Key] extends Record<string, any>
    ? {
      computed?: ComputedValuesRecord<T[Key], U, R>;
    } & {
      fields?: ComputedValues<T[Key], U, R>;
    }
    : { computed?: ComputedValuesRecord<T[Key], U, R> };
  };

export type ComputedValuesResults<
  T,
  U,
  R,
  C extends ComputedValuesRecord<T, U, R>
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

type NonObjectArrayData<T> = {
  value: T;
};

export type FormData<
  T,
  U,
  R,
  C extends ComputedValues<T, U, R>,
  S extends SubmitFuncMap<T>
  > = {
    [Key in keyof T]: T[Key] extends Array<infer I>
    ? I extends Record<string, any>
    ? {
      value: T[Key];
    } & DropEmpty<{
      computedValues: C[Key]["computed"] extends Record<string, any>
      ? ComputedValuesResults<T[Key], U, R, C[Key]["computed"]>
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
          U,
          R,
          C[Key] extends Record<string, any> ? C[Key]["fields"] : never,
          S[Key] extends Record<string, any> ? S[Key]["fields"] : never
        >;
      }[];
    }
    : {
      value: T[Key];
    } & DropEmpty<{
      computedValues: C[Key]["computed"] extends Record<string, any>
      ? ComputedValuesResults<T[Key], U, R, C[Key]["computed"]>
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
    } & DropEmpty<{
      computedValues: C[Key]["computed"] extends Record<string, any>
      ? ComputedValuesResults<T[Key], U, R, C[Key]["computed"]>
      : never;
    }> &
    DropEmptyFunction<{
      submit: S[Key] extends { submit: Function }
      ? () => Promise<SubmitFunc<T[Key]>>
      : never;
    }> & {
      fields: FormData<
        T[Key],
        U,
        R,
        C[Key] extends Record<string, any> ? C[Key]["fields"] : never,
        S[Key] extends Record<string, any> ? S[Key]["fields"] : never
      >;
    }
    : {
      value: T[Key];
    } & DropEmpty<{
      computedValues: C[Key]["computed"] extends Record<string, any>
      ? ComputedValuesResults<T[Key], U, R, C[Key]["computed"]>
      : never;
    }> &
    DropEmptyFunction<{
      submit: S[Key] extends { submit: Function }
      ? () => Promise<SubmitFunc<T[Key]>>
      : never;
    }>;
  };

type ActionCallback<TState> = (state: TState) => TState

type Action<TState, TParentState> = (updateState: (state: ActionCallback<TState> | TState) => void, value: TState, values: TParentState) => void

type ActionMap<TState, TParentState> = Record<string, Action<TState[keyof TState], TParentState>>

type StateActionMap<TState, TParentState> = { [Key in keyof TState]: { actions: ActionMap<TState, TParentState> } }

type ActionMapResult<TState, TParentState, TActionMap extends ActionMap<TState, TParentState>> =
  { [Key in keyof TActionMap]: TActionMap extends (state: ActionCallback<TState>) => void ? 'callback' : 'value' }

const createTestProps = <TState, TParentState, TActionMap extends StateActionMap<TState, TParentState>>(
  _: TState, __: TParentState, actionMap: TActionMap) => {
  return actionMap
}



const initial = { name: { first: { initial: '', title: '' }, last: '' } }

const a = createTestProps(initial, initial, {
  name: {
    actions: {
      update: (setState) => (lastName: string) => { setState(state => ({ ...state, last: lastName })) }
    }

  }
})






