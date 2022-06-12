import { FormEvent, useCallback, useMemo, useState } from "react";

import {
  addItemAtIndex,
  removeItemAtIndex,
  updateItemAtIndex,
} from "./utils/array";

export type ObjectError<T> = { [Key in keyof T]: { error: string | null } };

type Validator<T, U> = (value: T, values: U) => string | null;

type ValidatorMap<T extends { [k: string]: any }> = {
  [Key in keyof T]?: T[Key] extends (infer U)[]
    ? {
        validator: Validator<T[Key], T>;
        fields: ValidatorMap<U>;
      }
    : Validator<T[Key], T>;
};

interface Props<T extends Record<string, any>> {
  initialValues: T;
  validation?: ValidatorMap<T>;
}

type ArrayActions<T> = {
  addItem: (payload: { item: T }) => void;
  updateItem: (payload: { index: number; item: T }) => void;
  removeItem: (payload: { index: number }) => void;
};

const createArrayActions = <T extends Array<any>>(
  cbs: [
    (item: T[number]) => void,
    (index: number, item: T[number]) => void,
    (index: number) => void
  ]
): ArrayActions<T> => {
  const [addItemFunc, updateItemFunc, removeItemFunc] = cbs;

  return {
    addItem: (payload) => addItemFunc(payload.item),
    updateItem: (payload) => updateItemFunc(payload.index, payload.item),
    removeItem: (payload) => removeItemFunc(payload.index),
  };
};

type Actions<T> = { update: (payload: { value: T }) => void };

type ActionCreatorMap<T> = {
  [Key in keyof T]: T[Key] extends Array<any>
    ? ArrayActions<T[Key][number]>
    : Actions<T[Key]>;
};

type FormErrorMap<T extends Record<string, any>> = {
  [Key in keyof T]: T[Key] extends Array<infer U>
    ? U extends Record<string, any>
      ? { error: string | null; fieldErrors: FormErrorMap<U>[] }
      : { error: string | null; fieldErrors: (string | null)[] }
    : { error: string };
};

const createFormErrorMap = <T extends Record<string, any>>(
  value: T
): FormErrorMap<T> => {
  const errorMap: Partial<FormErrorMap<T>> = {};
  Object.keys(value).forEach((key) => {
    const typedKey = key as keyof T;
    if (Array.isArray(value[typedKey])) {
      // think this is incorrect\
      // what if array is empty
      if (typeof value[typedKey][0] === "object") {
        errorMap[typedKey] = {
          error: null,
          fieldErrors: value[typedKey].map(
            (v: typeof value[typeof key][number]) => createFormErrorMap(v)
          ),
        } as unknown as FormErrorMap<T>[keyof T];
      } else {
        errorMap[typedKey] = {
          error: null,
          fieldErrors: value[typedKey].map(() => null),
        } as unknown as FormErrorMap<T>[keyof T];
      }
    } else {
      errorMap[typedKey] = {
        error: null,
      } as unknown as FormErrorMap<T>[keyof T];
    }
  });

  return errorMap as FormErrorMap<T>;
};

// const resetErrorMap = <T extends Record<string, any>>(
//   errorMap: FormErrorMap<T>
// ): FormErrorMap<T> => {
//   const newErrorMap = { ...errorMap };
//   for (const item in newErrorMap) {
//     newErrorMap[item[0] as keyof T] = null;
//   }
//   return newErrorMap;
// };

export const useForm = <T extends Record<string, any>>(props: Props<T>) => {
  const { initialValues, validation } = props;

  const [formState, setFormState] = useState(initialValues);
  const [formErrors, setFormErrors] = useState<FormErrorMap<T>>(
    createFormErrorMap<T>(initialValues)
  );

  const clearError = (key: keyof T, updatedFormState: T) => {
    if (Array.isArray(updatedFormState[key])) {
      // What if array is empty
      // use better type guard
      if (typeof updatedFormState[key][0] === "object") {
        setFormErrors((errors) => {
          const state = {
            ...errors,
            [key]: {
              error: errors[key].error,
              fieldErrors: updatedFormState[key].map((_: any, index: number) =>
                createFormErrorMap<typeof updatedFormState[typeof key][number]>(
                  updatedFormState[key][index]
                )
              ),
            },
          };
          return state;
        });
      }
    } else {
      if (!formErrors[key]) {
        setFormErrors((errors) => ({ ...errors, [key]: { error: null } }));
      }
    }
  };

  const actions = useMemo(() => {
    const map: Partial<ActionCreatorMap<T>> = {};
    Object.keys(initialValues).forEach((key) => {
      const typedKey = key as keyof T;
      if (Array.isArray(initialValues[typedKey])) {
        map[typedKey] = createArrayActions<
          typeof initialValues[typeof typedKey]
        >([
          (item) => {
            const updatedFormState: T = {
              ...formState,
              [typedKey]: addItemAtIndex(formState[typedKey], item),
            };
            clearError(typedKey, updatedFormState);
            setFormState(updatedFormState);
          },
          (index, item) => {
            const updatedFormState: T = {
              ...formState,
              [typedKey]: updateItemAtIndex(formState[typedKey], index, item),
            };
            clearError(typedKey, updatedFormState);
            setFormState(updatedFormState);
          },
          (index) => {
            const updatedFormState: T = {
              ...formState,
              [typedKey]: removeItemAtIndex<T[keyof T]>(
                formState[typedKey],
                index
              ),
            };
            clearError(typedKey, updatedFormState);
            setFormState(updatedFormState);
          },
        ]) as ActionCreatorMap<T>[keyof T];
      } else {
        map[typedKey] = {
          update: (payload) => {
            const updatedFormState = {
              ...formState,
              [typedKey]: payload.value,
            };

            clearError(typedKey, updatedFormState);
            setFormState(updatedFormState);
          },
        } as ActionCreatorMap<T>[keyof T];
      }
    });
    return map as ActionCreatorMap<T>;
  }, [initialValues, setFormState, formState]);

  const validate = useCallback(() => {
    const validateForms = <X extends Record<string, any>>(
      validation: ValidatorMap<T>,
      formState: X
    ) => {
      const errors: Partial<FormErrorMap<X>> = {};
      Object.entries(validation).forEach(([key, validator]) => {
        const typedKey = key as keyof X;
        const typedValue = validator as ValidatorMap<X>[keyof X];
        if (typeof typedValue !== "function") {
          const typedValidator = typedValue?.validator as Validator<
            X[keyof X],
            X
          >;
          const error = typedValidator(formState[typedKey], formState);
          if (!typedValue) {
            errors[typedKey] = { error } as FormErrorMap<X>[keyof X];
            return;
          }
          const fieldValidators = typedValue.fields as ValidatorMap<
            X[keyof X][number]
          >;
          const fieldErrors: FormErrorMap<
            typeof formState[typeof typedKey][number]
          >[] = [];

          Object.keys(formState[typedKey]).forEach((_, index) => {
            fieldErrors.push(
              validateForms(fieldValidators, formState[typedKey][index])
            );
          });
          errors[typedKey] = {
            error,
            fieldErrors,
          } as unknown as X[typeof typedKey] extends Array<infer U>
            ? U extends Record<string, any>
              ? { error: string | null; fieldErrors: FormErrorMap<U>[] }
              : { error: string | null; fieldErrors: (string | null)[] }
            : { error: string };
          return;
        }
        const typedValidator = typedValue as Validator<X[keyof X], X>;
        const error = typedValidator(formState[typedKey], formState);
        errors[typedKey] = { error } as FormErrorMap<X>[keyof X];
      });
      return { ...createFormErrorMap(formState), ...errors };
    };

    if (validation) {
      const errors = validateForms(validation, formState);
      setFormErrors((errorsState) => ({ ...errorsState, ...errors }));
      return Object.values(errors).some((error) => error);
    }
  }, [validation, formErrors, setFormErrors, formState]);

  const onSubmit = (event: FormEvent, func: (values: T) => void): boolean => {
    event.preventDefault();
    const hasErrors = validate();
    if (!hasErrors) {
      func(formState);
      return true;
    }
    return false;
  };

  const reset = useCallback(() => {
    setFormState(initialValues);
    setFormErrors(createFormErrorMap(initialValues));
  }, [initialValues]);

  return {
    errors: formErrors,
    values: formState,
    actions,
    onSubmit,
    validate,
    reset,
  };
};
