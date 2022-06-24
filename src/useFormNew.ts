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
  R extends ConditionalValues<T, T>,
  S extends SubmitFuncMap<T>
> {
  initialValues: T;
  conditionalValues?: R;
  validation?: ValidationValues<T>;
  submit?: S;
}

const evaluateConditionalValues = <T, U, C extends ConditionalValues<T, U>>(
  key: keyof T,
  state: U,
  conditionalMap: C
): ConditionalValueResults<T, U, C> => {
  const conditionalValues: Partial<ConditionalValueResults<T, U, C>> = {};
  if (conditionalMap[key]) {
    Object.entries(conditionalMap[key]["conditional"]).forEach(
      ([cKey, cValue]) => {
        const typedCKey = cKey as keyof C[keyof T]["conditional"];
        const typedCValue =
          cValue as C[keyof T]["conditional"][typeof typedCKey];
        const cResult = typedCValue(state);
        conditionalValues[typedCKey] = cResult;
      }
    );
  }

  return conditionalValues as ConditionalValueResults<T, U, C>;
};

const createFormData = <
  T,
  R extends ConditionalValues<T, T>,
  S extends SubmitFuncMap<T>
>(
  state: T,
  conditionalMap: R
): FormData<T, R, S> => {
  const formData: Partial<FormData<T, R, S>> = {};

  Object.entries(state).forEach(([key, value]) => {
    const typedKey = key as keyof T;
    const typedValue = value as T[keyof T];

    // If value is an array
    if (Array.isArray(typedValue)) {
      if (typedValue.length) {
        if (typedValue[0] === Object(typedValue[0])) {
          const conditionalValues = evaluateConditionalValues(
            typedKey,
            state,
            conditionalMap
          );
          // Need to drop properties conditional values and submit if required
          const possiblyEmpty = {
            conditionalValues: conditionalValues as ConditionalValueResults<
              T[keyof T],
              T,
              ConditionalValues<T[keyof T], T>
            >,
          } as DropEmpty<{
            conditionalValues: ConditionalValueResults<
              T[keyof T],
              T,
              ConditionalValues<T[keyof T], T>
            >;
          }>;

          formData[typedKey] = {
            value: state[typedKey],
            error: null,
            ...possiblyEmpty,
            items: [],
          } as FormData<T, R, S>[keyof T];
        } else {
          const conditionalValues = evaluateConditionalValues(
            typedKey,
            state,
            conditionalMap
          );

          // Need to drop properties conditional values and submit if required
          const possiblyEmpty = {
            conditionalValues: conditionalValues as ConditionalValueResults<
              T[keyof T],
              T,
              ConditionalValues<T[keyof T], T>
            >,
          } as DropEmpty<{
            conditionalValues: ConditionalValueResults<
              T[keyof T],
              T,
              ConditionalValues<T[keyof T], T>
            >;
          }>;

          formData[typedKey] = {
            value: state[typedKey],
            error: null,
            ...possiblyEmpty,
            items: [],
          } as FormData<T, R, S>[keyof T];
        }
      } else {
        const conditionalValues = evaluateConditionalValues(
          typedKey,
          state,
          conditionalMap
        );

        // Need to drop properties conditional values and submit if required
        const possiblyEmpty = {
          conditionalValues: conditionalValues as ConditionalValueResults<
            T[keyof T],
            T,
            ConditionalValues<T[keyof T], T>
          >,
        } as DropEmpty<{
          conditionalValues: ConditionalValueResults<
            T[keyof T],
            T,
            ConditionalValues<T[keyof T], T>
          >;
        }>;

        formData[typedKey] = {
          value: state[typedKey],
          error: null,
          ...possiblyEmpty,
          items: [],
        } as FormData<T, R, S>[keyof T];
      }
    } else if (typeof typedValue === "object") {
      const conditionalValues = evaluateConditionalValues(
        typedKey,
        state,
        conditionalMap
      );

      // Need to drop properties conditional values and submit if required
      const possiblyEmpty = {
        conditionalValues: conditionalValues as ConditionalValueResults<
          T[keyof T],
          T,
          ConditionalValues<T[keyof T], T>
        >,
      } as DropEmpty<{
        conditionalValues: ConditionalValueResults<
          T[keyof T],
          T,
          ConditionalValues<T[keyof T], T>
        >;
      }>;

      formData[typedKey] = {
        value: state[typedKey],
        error: null,
        ...possiblyEmpty,
      } as FormData<T, R, S>[keyof T];
    } else {
      const conditionalValues = evaluateConditionalValues(
        typedKey,
        state,
        conditionalMap
      );

      // Need to drop properties conditional values and submit if required
      const possiblyEmpty = {
        conditionalValues: conditionalValues as ConditionalValueResults<
          T[keyof T],
          T,
          ConditionalValues<T[keyof T], T>
        >,
      } as DropEmpty<{
        conditionalValues: ConditionalValueResults<
          T[keyof T],
          T,
          ConditionalValues<T[keyof T], T>
        >;
      }>;
      formData[typedKey] = {
        value: state[typedKey],
        error: null,
        ...possiblyEmpty,
      } as FormData<T, R, S>[keyof T];
    }
  });

  return formData as FormData<T, R, S>;
};

export const useForm = <
  T,
  R extends ConditionalValues<T, T>,
  S extends SubmitFuncMap<T>
>(
  props: Props<T, R, S>
) => {
  const { initialValues, conditionalValues = {}, validation, submit } = props;

  const [state, setState] = useState<T>(initialValues);
  const [errorMap, setErrorMap] = useState<{}>({});

  const form: FormData<T, R, S> = createFormData(state, conditionalValues);

  return {
    fields: form,
  };
};
