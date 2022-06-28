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

type Action<TState, TParentState, TPayload extends Record<string, any>> = (
  updateState: (state: TState) => void,
  value: TState,
  values: TParentState
) => (payload: TPayload) => void;

type ActionMap<
  TState,
  TParentState,
  TPayload extends Record<string, any>
  > = Record<string, Action<TState, TParentState, TPayload>>;

export type StateActionMap<
  TState,
  TParentState,
  TPayload extends Record<string, any>
  > = {
    [Key in keyof TState]?: TState[Key] extends Array<infer TItem>
    ? TItem extends Record<string, any>
    ? {
      actions?: ActionMap<TState[Key], TParentState, TPayload>;
    } & { fields?: StateActionMap<TItem, TParentState, TPayload> }
    : {
      actions?: ActionMap<TState[Key], TParentState, TPayload>;
    }
    : TState[Key] extends Record<string, any>
    ? {
      actions?: ActionMap<TState[Key], TParentState, TPayload>;
    } & { fields?: StateActionMap<TState[Key], TParentState, TPayload> }
    : {
      actions?: ActionMap<TState[Key], TParentState, TPayload>;
    };
  };

const createActions = <
  TState,
  TParentState,
  TPayload extends Record<string, any>,
  TMap extends ActionMap<TState, TParentState, TPayload>
>(
  _: TState,
  map: TMap
) => {
  return map;
};

export type MapFunctionsToActions<TActionsMap> = {
  [Key in keyof TActionsMap]: TActionsMap[Key] extends (...args: any) => infer R
  ? R extends (...args: infer P) => void
  ? P extends [infer Y]
  ? {
    action: Key;
    payload: Y;
  }
  : {
    action: Key;
  }
  : never
  : never;
};

export type Dispatch<TActionsMap> = (
  action: MapFunctionsToActions<TActionsMap>[keyof MapFunctionsToActions<TActionsMap>]
) => void;

const test = createActions(
  { name: { first: "", last: "" } },
  {
    update: (set, value) => (payload: { name: string }) =>
      set({ ...value, name: { first: "", last: "" } }),
    submit: (_, value) => () => { },
  }
);

const createActionFunc = <U, T extends Dispatch<U>>(_: U, map: T) => {
  return map;
};

const dispatch = createActionFunc(test, (action) => {
  action.action === "update";
});

dispatch({ action: "update", payload: { name: "" } });

export type FormData<
  T,
  U,
  R,
  TActionPayload,
  C extends ComputedValues<T, U, R>,
  S extends SubmitFuncMap<T>,
  TActionMap extends StateActionMap<T, U, TActionPayload> = {}
  > = {
    [Key in keyof T]: T[Key] extends Array<infer I>
    ? I extends Record<string, any>
    ? {
      value: T[Key];
      dispatch: Dispatch<TActionMap[Key]["actions"] & { update: Action<T[Key], U, T[Key]> }>;
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
          TActionPayload,
          C[Key] extends Record<string, any> ? C[Key]["fields"] : never,
          S[Key] extends Record<string, any> ? S[Key]["fields"] : never,
          TActionMap[Key] extends Record<string, any>
          ? TActionMap[Key]["fields"]
          : never
        >;
      }[];
    }
    : {
      value: T[Key];
      dispatch: Dispatch<TActionMap[Key]["actions"] & { update: Action<T[Key], U, T[Key]> }>;
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
      dispatch: Dispatch<{ update: Action<T[Key], U, T[Key]> } & TActionMap[Key]["actions"]>;
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
        TActionPayload,
        C[Key] extends Record<string, any> ? C[Key]["fields"] : never,
        S[Key] extends Record<string, any> ? S[Key]["fields"] : never,
        TActionMap[Key] extends Record<string, any>
        ? TActionMap[Key]["fields"]
        : never
      >;
    }
    : {
      value: T[Key];
      dispatch: Dispatch<{ update: Action<T[Key], U, T[Key]> } & TActionMap[Key]['actions']>;
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
