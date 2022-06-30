import { useState } from "react";

import {
  ComputedValues,
  FormData,
  ComputedValuesResults,
  DropEmpty,
  ComputedValuesRecord,
  StateActionMap,
  Dispatch,
} from "./types";
import { updateItemAtIndex } from "./utils/array";

interface Props<
  TState,
  TComputedValuesReturn,
  TActionPayload,
  TComputedValuesMap extends ComputedValues<TState, TState, TComputedValuesReturn>,
  TActions extends StateActionMap<TState, TState, TActionPayload>
  > {
  initialValues: TState;
  computedValues?: TComputedValuesMap;
  actions?: TActions;
}

const evaluateComputedValues = <
  TState,
  TParentState,
  TComputedValuesReturn,
  TComputedValuesMap extends ComputedValuesRecord<TState, TParentState, TComputedValuesReturn>
>(
  state: TState,
  parentState: TParentState,
  computedValueMap: TComputedValuesMap
): ComputedValuesResults<TState, TParentState, TComputedValuesReturn, TComputedValuesMap> => {
  const computedValues: Partial<ComputedValuesResults<TState, TParentState, TComputedValuesReturn, TComputedValuesMap>> = {};
  Object.entries(computedValueMap).forEach(([cKey, cValue]) => {
    const computedValueKey = cKey as keyof TComputedValuesMap;
    const computedValueFunc = cValue;
    const computedValueResult = computedValueFunc(state, parentState);
    computedValues[computedValueKey] = computedValueResult as ReturnType<
      TComputedValuesMap[keyof TComputedValuesMap]
    >;
  });

  return computedValues as ComputedValuesResults<TState, TParentState, TComputedValuesReturn, TComputedValuesMap>;
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

const createUpdateFunction = <TState>(setState: (state: TState) => void) => {
  const updateFunc = (newState: TState) => setState(newState);

  return (action: { action: "update"; payload: TState }) =>
    updateFunc(action.payload);
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

  // If user hasn't specified their own 'update' action we
  // add a default update action
  if (!mappedActionFunctionsToActions["update"]) {
    mappedActionFunctionsToActions["update"] = (newState: TState) =>
      setState(newState);
  }

  const dispatch = (action: { action: keyof TActionsMap; payload: any }) => {
    mappedActionFunctionsToActions[action.action](action.payload);
  };

  return dispatch;
};

const createFormData = <
  TState,
  TParentState,
  TComputedValuesReturn,
  TActionsPayload,
  TComputedValuesMap extends ComputedValues<TState, TParentState, TComputedValuesReturn>,
  TActionsMap extends StateActionMap<TState, TParentState, TActionsPayload>
>(
  state: TState,
  allState: TParentState,
  computedValuesMap: TComputedValuesMap,
  actionsMap: TActionsMap,
  setState: (state: TState) => void
): FormData<TState, TParentState, TComputedValuesReturn, TActionsPayload, TComputedValuesMap, TActionsMap> => {
  const formData: Partial<
    FormData<TState, TParentState, TComputedValuesReturn, TActionsPayload, TComputedValuesMap, TActionsMap>
  > = {};

  Object.entries(state).forEach(([key, value]) => {
    const typedKey = key as keyof TState;
    const typedValue = value as TState[keyof TState];

    const computedValues = computedValuesMap[typedKey]
      ? deleteEmptyObjectProperties({
        computedValues: evaluateComputedValues(
          typedValue,
          allState,
          // Don't like this type assertion
          computedValuesMap[typedKey]["computed"]
            ? (computedValuesMap[typedKey][
              "computed"
            ] as ComputedValuesRecord<TState[keyof TState], TParentState, TComputedValuesReturn>)
            : {}
        ),
      })
      : {};

    const dispatch =
      actionsMap[typedKey] && actionsMap[typedKey]["actions"]
        ? createActionFunction(
          typedValue,
          allState,
          (newState: TState[keyof TState]) => {
            setState({ ...state, [typedKey]: newState });
          },
          actionsMap[typedKey]['actions']
        )
        : createUpdateFunction((newState: TState[keyof TState]) =>
          setState({ ...state, [typedKey]: newState })
        );

    let items = {};

    if (Array.isArray(typedValue)) {
      if (typedValue.length) {
        // if array of objects
        if (typedValue[0] === Object(typedValue[0])) {
          items = {
            items: typedValue.map((item, index) => {
              const nestedComputedValuesMap = computedValuesMap[typedKey]
                ? computedValuesMap[typedKey]["fields"]
                : {};

              const nestedActionsMap =
                actionsMap[typedKey] && actionsMap[typedKey]["fields"]
                  ? actionsMap[typedKey]["fields"]
                  : {};

              return {
                value: item,
                dispatch: createUpdateFunction((newState: typeof item) =>
                  setState({
                    ...state,
                    [typedKey]: updateItemAtIndex(typedValue, index, newState),
                  })
                ),
                fields: createFormData(
                  item as typeof typedValue[number],
                  allState,
                  nestedComputedValuesMap,
                  nestedActionsMap,
                  (newState: typeof item) => {
                    setState({
                      ...state,
                      [typedKey]: updateItemAtIndex(
                        typedValue,
                        index,
                        newState
                      ),
                    });
                  }
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

      const nestedActionsMap = actionsMap[typedKey]
        ? actionsMap[typedKey]["fields"]
        : {};

      nestedFields = {
        fields: createFormData(
          typedValue,
          allState,
          nestedComputedValuesMap,
          nestedActionsMap,
          (newState: TState[keyof TState]) => setState({ ...state, [typedKey]: newState })
        ),
      };
    }

    const field: FormData<
      TState,
      TParentState,
      TComputedValuesReturn,
      TActionsPayload,
      TComputedValuesMap,
      TActionsMap
    >[keyof TState] = {
      value: typedValue,
      ...computedValues,
      ...nestedFields,
      ...items,
      dispatch,
    } as FormData<TState, TParentState, TComputedValuesReturn, TActionsPayload, TComputedValuesMap, TActionsMap>[keyof TState];

    formData[typedKey] = field;
  });

  return formData as FormData<
    TState,
    TParentState,
    TComputedValuesReturn,
    TActionsPayload,
    TComputedValuesMap,
    TActionsMap
  >;
};

export const useForm = <
  TState,
  TReturn,
  TActionsPayload,
  TComputedValues extends ComputedValues<TState, TState, TReturn>,
  TActionsMap extends StateActionMap<TState, TState, TActionsPayload>
>(
  props: Props<TState, TReturn, TActionsPayload, TComputedValues, TActionsMap>
) => {
  const {
    initialValues,
    computedValues = {},
    actions = {},
  } = props;

  const [state, setState] = useState<TState>(initialValues);

  const form: FormData<TState, TState, TReturn, TActionsPayload, TComputedValues, TActionsMap> =
    createFormData(state, state, computedValues, actions, (state: TState) =>
      setState(state)
    );

  return {
    fields: form,
  };
};
