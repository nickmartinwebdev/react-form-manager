import { useState } from "react";

import {
  ComputedValues,
  SubmitFuncMap,
  FormData,
  ComputedValuesResults,
  DropEmpty,
  ComputedValuesRecord,
  StateActionMap,
  Dispatch,
  MapFunctionsToActions,
} from "./types";

interface Props<
  T,
  TReturn,
  TActionPayload,
  R extends ComputedValues<T, T, TReturn>,
  S extends SubmitFuncMap<T>,
  TActions extends StateActionMap<T, T, TActionPayload>
> {
  initialValues: T;
  computedValues?: R;
  submit?: S;
  actions?: TActions;
}

const evaluateComputedValues = <
  T,
  U,
  R,
  C extends ComputedValuesRecord<T, U, R>
>(
  nestedState: T,
  state: U,
  computedValueMap: C
): ComputedValuesResults<T, U, R, C> => {
  const computedValues: Partial<ComputedValuesResults<T, U, R, C>> = {};
  Object.entries(computedValueMap).forEach(([cKey, cValue]) => {
    const computedValueKey = cKey as keyof C;
    const computedValueFunc = cValue;
    const computedValueResult = computedValueFunc(nestedState, state);
    computedValues[computedValueKey] = computedValueResult as ReturnType<
      C[keyof C]
    >;
  });

  return computedValues as ComputedValuesResults<T, U, R, C>;
};

const deleteEmptyObjectProperties = <T>(value: T): DropEmpty<T> => {
  const newObject = { ...value };
  Object.entries(newObject).forEach(([key, value]) => {
    if (!Object.keys(value).length) {
      delete newObject[key];
    }
  });
  return newObject as unknown as DropEmpty<T>;
};

const createActionFunction = <TState, TParentState, TActionsMap>(
  state: TState,
  parentState: TParentState,
  setState: (state: TState) => void,
  actionFunctionsMap: TActionsMap
): Dispatch<TActionsMap> => {
  const mappedActionFunctionsToActions: Partial<
    Record<keyof TActionsMap, Function>
  > = {};
  Object.entries(actionFunctionsMap).forEach(([key, func]) => {
    const typedKey = key as keyof TActionsMap;
    const typedFunc = func as TActionsMap[keyof TActionsMap];
    console.log("result", typedKey, typedFunc);
    if (typeof typedFunc !== "function") {
      return;
    }
    const funcResult = typedFunc(setState, state, parentState);

    if (typeof funcResult !== "function") {
      return;
    }

    mappedActionFunctionsToActions[typedKey] = (
      payload: Parameters<typeof funcResult>[0]
    ) => funcResult(payload);
  });

  console.log("mapped", mappedActionFunctionsToActions);

  const dispatch = (action: { action: keyof TActionsMap; payload: any }) => {
    console.log("action", action);
    mappedActionFunctionsToActions[action.action](action.payload);
  };

  return dispatch;
};

const createFormData = <
  T,
  U,
  TReturn,
  TActionsPayload,
  R extends ComputedValues<T, U, TReturn>,
  S extends SubmitFuncMap<T>,
  TActionsMap extends StateActionMap<T, U, TActionsPayload>
>(
  state: T,
  allState: U,
  computedValuesMap: R,
  submitFuncMap: S,
  actionsMap: TActionsMap,
  setState: (state: T) => void
): FormData<T, U, TReturn, TActionsPayload, R, S, TActionsMap> => {
  const formData: Partial<
    FormData<T, U, TReturn, TActionsPayload, R, S, TActionsMap>
  > = {};

  Object.entries(state).forEach(([key, value]) => {
    const typedKey = key as keyof T;
    const typedValue = value as T[keyof T];

    const computedValues = computedValuesMap[typedKey]
      ? deleteEmptyObjectProperties({
          computedValues: evaluateComputedValues(
            typedValue,
            allState,
            // Don't like this type assertion
            computedValuesMap[typedKey]["computed"]
              ? (computedValuesMap[typedKey][
                  "computed"
                ] as ComputedValuesRecord<T[keyof T], U, TReturn>)
              : {}
          ),
        })
      : {};

    const dispatch = actionsMap[typedKey]
      ? createActionFunction(
          typedValue,
          allState,
          (newState: T[keyof T]) => {
            console.log("new", newState, state);
            setState({ ...state, [typedKey]: newState });
          },
          actionsMap[typedKey]["actions"]
        )
      : () => {};

    let items = {};

    if (Array.isArray(typedValue)) {
      if (typedValue.length) {
        // if array of objects
        if (typedValue[0] === Object(typedValue[0])) {
          items = {
            items: typedValue.map((item) => {
              const nestedComputedValuesMap = computedValuesMap[typedKey]
                ? computedValuesMap[typedKey]["fields"]
                : {};

              const nestedSubmitFunctionsMap = submitFuncMap[typedKey]
                ? submitFuncMap[typedKey]["fields"]
                : {};

              const nestedActionsMap = actionsMap[typedKey]
                ? actionsMap[typedKey]["fields"]
                : {};

              return {
                fields: createFormData(
                  item as typeof typedValue[number],
                  allState,
                  nestedComputedValuesMap,
                  nestedSubmitFunctionsMap,
                  nestedActionsMap,
                  () => {}
                ),
              };
            }),
          };
        } else {
          // if array of primitives
          items = {
            items: typedValue.map((item) => {
              return {
                value: item as typeof typedValue[number],
              };
            }),
          };
        }
      }
    }

    let nestedFields = {};

    if (!Array.isArray(typedValue) && typedValue === Object(typedValue)) {
      const nestedComputedValuesMap = computedValuesMap[typedKey]
        ? computedValuesMap[typedKey]["fields"]
        : {};

      const nestedSubmitFunctionsMap = submitFuncMap[typedKey]
        ? submitFuncMap[typedKey]["fields"]
        : {};

      const nestedActionsMap = actionsMap[typedKey]
        ? actionsMap[typedKey]["fields"]
        : {};

      nestedFields = {
        fields: createFormData(
          typedValue,
          allState,
          nestedComputedValuesMap,
          nestedSubmitFunctionsMap,
          nestedActionsMap,
          () => {}
        ),
      };
    }

    const field: FormData<
      T,
      U,
      TReturn,
      TActionsPayload,
      R,
      S,
      TActionsMap
    >[keyof T] = {
      value: typedValue,
      ...computedValues,
      ...nestedFields,
      ...items,
      dispatch,
    } as FormData<T, U, TReturn, TActionsPayload, R, S, TActionsMap>[keyof T];

    formData[typedKey] = field;
  });

  return formData as FormData<
    T,
    U,
    TReturn,
    TActionsPayload,
    R,
    S,
    TActionsMap
  >;
};

export const useForm = <
  T,
  TReturn,
  TActionsPayload,
  R extends ComputedValues<T, T, TReturn>,
  S extends SubmitFuncMap<T>,
  TActionsMap extends StateActionMap<T, T, TActionsPayload>
>(
  props: Props<T, TReturn, TActionsPayload, R, S, TActionsMap>
) => {
  const {
    initialValues,
    computedValues = {},
    submit = {},
    actions = {},
  } = props;

  const [state, setState] = useState<T>(initialValues);

  const form: FormData<T, T, TReturn, TActionsPayload, R, S, TActionsMap> =
    createFormData(state, state, computedValues, submit, actions, (state: T) =>
      setState(state)
    );

  return {
    fields: form,
  };
};
