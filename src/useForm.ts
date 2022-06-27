import { useState } from "react";

import {
  ComputedValues,
  SubmitFuncMap,
  FormData,
  ComputedValuesResults,
  DropEmpty,
  ComputedValuesRecord,
} from "./types";

interface Props<
  T,
  TReturn,
  R extends ComputedValues<T, T, TReturn>,
  S extends SubmitFuncMap<T>
  > {
  initialValues: T;
  computedValues?: R;
  submit?: S;
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

const createFormData = <
  T,
  U,
  TReturn,
  R extends ComputedValues<T, U, TReturn>,
  S extends SubmitFuncMap<T>
>(
  state: T,
  allState: U,
  computedValuesMap: R,
  submitFuncMap: S
): FormData<T, U, TReturn, R, S> => {
  const formData: Partial<FormData<T, U, TReturn, R, S>> = {};

  Object.entries(state).forEach(([key, value]) => {
    const typedKey = key as keyof T;
    const typedValue = value as T[keyof T];


    const computedValues = computedValuesMap[typedKey] ? deleteEmptyObjectProperties({
      computedValues: evaluateComputedValues(
        typedValue,
        allState,
        computedValuesMap[typedKey]['computed'] ? computedValuesMap[typedKey]['computed'] as
          ComputedValuesRecord<T[keyof T], U, TReturn> : {}
      ),
    }) : {};

    let items = {};

    if (Array.isArray(typedValue)) {
      if (typedValue.length) {
        // if array of objects
        if (typedValue[0] === Object(typedValue[0])) {
          items = {
            items: typedValue.map((item) => {
              const nestedComputedValuesMap = computedValuesMap[typedKey]
                ? computedValuesMap[typedKey]["fields"]
                : ({} as ComputedValues<T[keyof T], T, TReturn>);

              const nestedSubmitFunctionsMap = submitFuncMap[typedKey]
                ? submitFuncMap[typedKey]["fields"]
                : ({} as SubmitFuncMap<T[keyof T]>);

              return {
                fields: createFormData(
                  item as typeof typedValue[number],
                  allState,
                  nestedComputedValuesMap,
                  nestedSubmitFunctionsMap
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
        : ({} as ComputedValues<T[keyof T], T, TReturn>);

      const nestedSubmitFunctionsMap = submitFuncMap[typedKey]
        ? submitFuncMap[typedKey]["fields"]
        : ({} as SubmitFuncMap<T[keyof T]>);

      nestedFields = {
        fields: createFormData(
          typedValue,
          allState,
          nestedComputedValuesMap,
          nestedSubmitFunctionsMap
        ),
      };
    }

    const field: FormData<T, U, TReturn, R, S>[keyof T] = {
      value: typedValue,
      ...computedValues,
      ...nestedFields,
      ...items,
    } as FormData<T, U, TReturn, R, S>[keyof T];

    formData[typedKey] = field;
  });

  return formData as FormData<T, U, TReturn, R, S>;
};

export const useForm = <
  T,
  TReturn,
  R extends ComputedValues<T, T, TReturn>,
  S extends SubmitFuncMap<T>
>(
  props: Props<T, TReturn, R, S>
) => {
  const { initialValues, computedValues = {}, submit = {} } = props;

  const [state, setState] = useState<T>(initialValues);

  const form: FormData<T, T, TReturn, R, S> = createFormData(
    state,
    state,
    computedValues,
    submit
  );

  return {
    fields: form,
  };
};
