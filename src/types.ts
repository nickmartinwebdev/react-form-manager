export type ComputedValueFunc<TState, TParentState, TReturn> = (value: TState, values: TParentState) => TReturn;

export type ComputedValuesRecord<TState, TParentState, TReturn> = Partial<
  Record<string, ComputedValueFunc<TState, TParentState, TReturn>>
>;

export type ComputedValues<
  TState extends Record<string, any>,
  TParentState extends Record<string, any>,
  TComputedValuesReturn
  > = {
    [Key in keyof TState]?: TState[Key] extends Array<infer I>
    ? I extends Record<string, any>
    ? {
      computed?: ComputedValuesRecord<TState[Key], TParentState, TComputedValuesReturn>;
    } & { fields?: ComputedValues<I, TParentState, TComputedValuesReturn> }
    : { computed?: ComputedValuesRecord<TState[Key], TParentState, TComputedValuesReturn> }
    : TState[Key] extends Record<string, any>
    ? {
      computed?: ComputedValuesRecord<TState[Key], TParentState, TComputedValuesReturn>;
    } & {
      fields?: ComputedValues<TState[Key], TParentState, TComputedValuesReturn>;
    }
    : { computed?: ComputedValuesRecord<TState[Key], TParentState, TComputedValuesReturn> };
  };

export type ComputedValuesResults<
  TState,
  TParentState,
  TComputedValuesReturn,
  TComputedValuesMap extends ComputedValuesRecord<TState, TParentState, TComputedValuesReturn>
  > = {
    [Key in keyof TComputedValuesMap]: ReturnType<TComputedValuesMap[Key]>;
  };

export type DropEmpty<T> = {
  [K in keyof T as keyof T[K] extends never ? never : K]: T[K];
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
    [Key in keyof TState]?: TState[Key] extends Array<infer I>
    ? I extends Record<string, any>
    ? {
      actions?: ActionMap<TState[Key], TParentState, TPayload>;
    } & {
      fields?: StateActionMap<I, TParentState, TPayload>;
    }
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

type NonObjectArrayData<T> = {
  value: T;
};

export type FormData<
  TState,
  TParentState,
  TComputedValuesReturn,
  TActionPayload,
  TComputedValuesMap extends ComputedValues<TState, TParentState, TComputedValuesReturn>,
  TActionMap extends StateActionMap<TState, TParentState, TActionPayload> = {}
  > = {
    [Key in keyof TState]: TState[Key] extends Array<infer TArrayItem>
    ? TArrayItem extends Record<string, any>
    ? {
      value: TState[Key];
      dispatch: Dispatch<
        { update: Action<TState[Key], TParentState, TState[Key]> } & TActionMap[Key]["actions"]
      >;
    } & DropEmpty<{
      computedValues: TComputedValuesMap[Key]["computed"] extends Record<string, any>
      ? ComputedValuesResults<TState[Key], TParentState, TComputedValuesReturn, TComputedValuesMap[Key]["computed"]>
      : never;
    }> & {
      items: {
        value: TArrayItem;
        dispatch: Dispatch<{
          update: Action<TArrayItem, TParentState, TArrayItem>;
        }>;
        fields: FormData<
          TArrayItem,
          TParentState,
          TComputedValuesReturn,
          TActionPayload,
          TComputedValuesMap[Key] extends Record<string, any> ? TComputedValuesMap[Key]["fields"] : never,
          TActionMap[Key] extends Record<string, any>
          ? TActionMap[Key]["fields"]
          : never
        >;
      }[];
    }
    : {
      value: TState[Key];
      dispatch: Dispatch<
        TActionMap[Key]["actions"] & { update: Action<TState[Key], TParentState, TState[Key]> }
      >;
    } & DropEmpty<{
      computedValues: TComputedValuesMap[Key]["computed"] extends Record<string, any>
      ? ComputedValuesResults<TState[Key], TParentState, TComputedValuesReturn, TComputedValuesMap[Key]["computed"]>
      : never;
    }> &
    { items: NonObjectArrayData<TArrayItem>[] }
    : TState[Key] extends Record<string, any>
    ? {
      value: TState[Key];
      dispatch: Dispatch<
        { update: Action<TState[Key], TParentState, TState[Key]> } & TActionMap[Key]["actions"]
      >;
    } & DropEmpty<{
      computedValues: TComputedValuesMap[Key]["computed"] extends Record<string, any>
      ? ComputedValuesResults<TState[Key], TParentState, TComputedValuesReturn, TComputedValuesMap[Key]["computed"]>
      : never;
    }> & {
      fields: FormData<
        TState[Key],
        TParentState,
        TComputedValuesReturn,
        TActionPayload,
        TComputedValuesMap[Key] extends Record<string, any> ? TComputedValuesMap[Key]["fields"] : never,
        TActionMap[Key] extends Record<string, any>
        ? TActionMap[Key]["fields"]
        : never
      >;
    }
    : {
      value: TState[Key];
      dispatch: Dispatch<
        { update: Action<TState[Key], TParentState, TActionPayload> } & TActionMap[Key]["actions"]
      >;
    } & DropEmpty<{
      computedValues: TComputedValuesMap[Key]["computed"] extends Record<string, any>
      ? ComputedValuesResults<TState[Key], TParentState, TComputedValuesReturn, TComputedValuesMap[Key]["computed"]>
      : never;
    }>;
  };
