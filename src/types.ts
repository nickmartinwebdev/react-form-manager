import { TaskState } from "vitest";

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

type Action<TState, TParentState, TPayload extends Record<string, any>> = (
  updateState: (state: TState) => void,
  value: TState,
  values: TParentState
) => (payload: TPayload) => void;

type ActionMap<
  TState,
  TParentState,
  TPayload extends Record<string, any>
> = Record<string, Action<TState[keyof TState], TParentState, TPayload>>;

type StateActionMap<
  TState,
  TParentState,
  TPayload extends Record<string, any>
> = {
  [Key in keyof TState]: { actions: ActionMap<TState, TParentState, TPayload> };
};

type ActionMapResult<
  TState,
  TParentState,
  TPayload extends Record<string, any>,
  TActionMap extends ActionMap<TState, TParentState, TPayload>
> = {
  [Key in keyof TActionMap]: TActionMap[Key] extends (...params: any) => infer R
    ? R extends (...args: any) => void
      ? Parameters<R> extends [infer T]
        ? T extends Record<string, any>
          ? (params: T) => void
          : (params: Parameters<R>) => void
        : (params: Parameters<R>) => void
      : () => void
    : never;
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

type MapFunctionsToActions<T> = {
  [Key in keyof T]: T[Key] extends (...args: any) => infer R
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

type Dispatch<U, T extends MapFunctionsToActions<U>> = (
  action: T[keyof T]
) => void;

const test = createActions(
  { name: { first: "", last: "" } },
  {
    update: (set, value) => (payload: { name: string }) =>
      set({ ...value, last: payload.name }),
    submit: (_, value) => () => {},
  }
);

const createActionFunc = <
  U,
  B extends MapFunctionsToActions<U>,
  T extends Dispatch<U, B>
>(
  _: U,
  map: T
) => {
  return map;
};

const dispatch = createActionFunc(test, (action) => {
  action.action === "update";
});

dispatch({ action: "update", payload: { name: "" } });

const createTestProps = <
  TState,
  TParentState,
  TPayload,
  TActionMap extends StateActionMap<TState, TParentState, TPayload>
>(
  _: TState,
  __: TParentState,
  actionMap: TActionMap
) => {
  return actionMap;
};

const initial = { name: { first: { initial: "", title: "" }, last: "" } };

const a = createTestProps(initial, initial, {
  name: {
    actions: {
      update: (setState, state, values) => () => {
        setState({ ...state, last: "last" });
      },
      submit: () => (wow: string) => {
        console.log("hey");
      },
    },
  },
});

a.name.actions.update(() => {}, initial.name, initial)();
