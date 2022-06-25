import { useState } from "react";

import {
  ConditionalValues,
  SubmitFuncMap,
  ValidationValues,
  FormData,
  ConditionalValueResults,
  DropEmpty,
} from "./types";

interface Props<
  T,
  TReturn,
  R extends ConditionalValues<T, T, TReturn>,
  S extends SubmitFuncMap<T>
> {
  initialValues: T;
  conditionalValues?: R;
  validation?: ValidationValues<T>;
  submit?: S;
}

const evaluateConditionalValues = <
  T extends Record<string, any>,
  U,
  R,
  C extends ConditionalValues<T, U, R>
>(
  nestedState: T,
  state: U,
  key: keyof T,
  conditionalMap: C
): ConditionalValueResults<T, U, R, C[keyof C]["conditional"]> => {
  const conditionalValues: Partial<
    ConditionalValueResults<T, U, R, C[keyof C]["conditional"]>
  > = {};
  if (conditionalMap[key] && conditionalMap[key]["conditional"]) {
    Object.entries(conditionalMap[key]["conditional"]).forEach(
      ([cKey, cValue]) => {
        const typedCKey = cKey as keyof C[keyof T]["conditional"];
        const typedCValue =
          cValue as C[keyof T]["conditional"][typeof typedCKey];
        const cResult = typedCValue(nestedState[key], state);
        conditionalValues[typedCKey] = cResult as ReturnType<
          C[keyof C]["conditional"][keyof C[keyof T]["conditional"]]
        >;
      }
    );
  }

  return conditionalValues as ConditionalValueResults<
    T,
    U,
    R,
    C[keyof C]["conditional"]
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
  R extends ConditionalValues<T, T, TReturn>,
  S extends SubmitFuncMap<T>
>(
  state: T,
  allState: U,
  conditionalMap: R
): FormData<T, TReturn, R, S> => {
  const formData: Partial<FormData<T, TReturn, R, S>> = {};

  Object.entries(state).forEach(([key, value]) => {
    const typedKey = key as keyof T;
    const typedValue = value as T[keyof T];

    const conditionalValues = deleteEmptyObjectProperties({
      conditionalValues: evaluateConditionalValues(
        state,
        allState,
        typedKey,
        conditionalMap as ConditionalValues<T, U, TReturn>
      ),
    });

    let items = {};

    if (Array.isArray(typedValue)) {
      if (typedValue.length) {
        // if array of objects
        if (typedValue[0] === Object(typedValue[0])) {
          items = {
            items: typedValue.map((item) => {
              const nestedConditionalMap = conditionalMap[typedKey]
                ? conditionalMap[typedKey]["fields"]
                : ({} as ConditionalValues<T[keyof T], T, TReturn>);
              return {
                fields: createFormData(
                  item as typeof typedValue[number],
                  allState,
                  nestedConditionalMap
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
      const nestedConditionalMap = conditionalMap[typedKey]
        ? conditionalMap[typedKey]["fields"]
        : ({} as ConditionalValues<T[keyof T], T, TReturn>);

      nestedFields = {
        fields: createFormData(typedValue, allState, nestedConditionalMap),
      };
    }

    const field: FormData<T, TReturn, R, S>[keyof T] = {
      value: typedValue,
      error: null,
      ...conditionalValues,
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
  R extends ConditionalValues<T, T, TReturn>,
  S extends SubmitFuncMap<T>
>(
  props: Props<T, TReturn, R, S>
) => {
  const { initialValues, conditionalValues = {}, validation, submit } = props;

  const [state, setState] = useState<T>(initialValues);
  const [errorMap, setErrorMap] = useState<{}>({});

  const form: FormData<T, TReturn, R, S> = createFormData(
    state,
    state,
    conditionalValues
  );

  return {
    fields: form,
  };
};
