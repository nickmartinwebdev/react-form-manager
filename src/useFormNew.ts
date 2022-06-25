import { useState } from "react";

import {
  ComputedValues,
  SubmitFuncMap,
  ValidationValues,
  FormData,
  ComputedValuesResults,
  DropEmpty,
} from "./types";

interface Props<
  T,
  TReturn,
  R extends ComputedValues<T, T, TReturn>,
  S extends SubmitFuncMap<T>
> {
  initialValues: T;
  computedValues?: R;
  validation?: ValidationValues<T>;
  submit?: S;
}

const evaluateConditionalValues = <
  T extends Record<string, any>,
  U,
  R,
  C extends ComputedValues<T, U, R>
>(
  nestedState: T,
  state: U,
  key: keyof T,
  computedValueMap: C
): ComputedValuesResults<T, U, R, C[keyof C]["computed"]> => {
  const computedValues: Partial<
    ComputedValuesResults<T, U, R, C[keyof C]["computed"]>
  > = {};
  if (computedValueMap[key] && computedValueMap[key]["computed"]) {
    Object.entries(computedValueMap[key]["computed"]).forEach(
      ([cKey, cValue]) => {
        const typedCKey = cKey as keyof C[keyof T]["computed"];
        const typedCValue = cValue as C[keyof T]["computed"][typeof typedCKey];
        const cResult = typedCValue(nestedState[key], state);
        computedValues[typedCKey] = cResult as ReturnType<
          C[keyof C]["computed"][keyof C[keyof T]["computed"]]
        >;
      }
    );
  }

  return computedValues as ComputedValuesResults<
    T,
    U,
    R,
    C[keyof C]["computed"]
  >;
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
  R extends ComputedValues<T, T, TReturn>,
  S extends SubmitFuncMap<T>
>(
  state: T,
  allState: U,
  computedValuesMap: R
): FormData<T, TReturn, R, S> => {
  const formData: Partial<FormData<T, TReturn, R, S>> = {};

  Object.entries(state).forEach(([key, value]) => {
    const typedKey = key as keyof T;
    const typedValue = value as T[keyof T];

    const computedValues = deleteEmptyObjectProperties({
      computedValues: evaluateConditionalValues(
        state,
        allState,
        typedKey,
        computedValuesMap as ComputedValues<T, U, TReturn>
      ),
    });

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
              return {
                fields: createFormData(
                  item as typeof typedValue[number],
                  allState,
                  nestedComputedValuesMap
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

      nestedFields = {
        fields: createFormData(typedValue, allState, nestedComputedValuesMap),
      };
    }

    const field: FormData<T, TReturn, R, S>[keyof T] = {
      value: typedValue,
      error: null,
      ...computedValues,
      ...nestedFields,
      ...items,
    } as FormData<T, TReturn, R, S>[keyof T];

    // // Need to drop properties conditional values and submit if required

    // // if value is an object

    formData[typedKey] = field;
  });

  return formData as FormData<T, TReturn, R, S>;
};

export const useForm = <
  T,
  TReturn,
  R extends ComputedValues<T, T, TReturn>,
  S extends SubmitFuncMap<T>
>(
  props: Props<T, TReturn, R, S>
) => {
  const { initialValues, computedValues = {}, validation, submit } = props;

  const [state, setState] = useState<T>(initialValues);
  const [errorMap, setErrorMap] = useState<{}>({});

  const form: FormData<T, TReturn, R, S> = createFormData(
    state,
    state,
    computedValues
  );

  return {
    fields: form,
  };
};
