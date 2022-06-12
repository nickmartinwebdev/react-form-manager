import { useCallback, useMemo, useState } from "react";
import { addItemAtIndex, removeItemAtIndex, updateItemAtIndex, } from "./utils/array";
const createArrayActions = (cbs) => {
    const [addItemFunc, updateItemFunc, removeItemFunc] = cbs;
    return {
        addItem: (payload) => addItemFunc(payload.item),
        updateItem: (payload) => updateItemFunc(payload.index, payload.item),
        removeItem: (payload) => removeItemFunc(payload.index),
    };
};
const createFormErrorMap = (value) => {
    const errorMap = {};
    Object.keys(value).forEach((key) => {
        const typedKey = key;
        if (Array.isArray(value[typedKey])) {
            // think this is incorrect\
            // what if array is empty
            if (typeof value[typedKey][0] === "object") {
                errorMap[typedKey] = {
                    error: null,
                    fieldErrors: value[typedKey].map((v) => createFormErrorMap(v)),
                };
            }
            else {
                errorMap[typedKey] = {
                    error: null,
                    fieldErrors: value[typedKey].map(() => null),
                };
            }
        }
        else {
            errorMap[typedKey] = {
                error: null,
            };
        }
    });
    return errorMap;
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
export const useForm = (props) => {
    const { initialValues, validation } = props;
    const [formState, setFormState] = useState(initialValues);
    const [formErrors, setFormErrors] = useState(createFormErrorMap(initialValues));
    const clearError = (key, updatedFormState) => {
        if (Array.isArray(updatedFormState[key])) {
            // What if array is empty
            // use better type guard
            if (typeof updatedFormState[key][0] === "object") {
                setFormErrors((errors) => {
                    const state = Object.assign(Object.assign({}, errors), { [key]: {
                            error: errors[key].error,
                            fieldErrors: updatedFormState[key].map((_, index) => createFormErrorMap(updatedFormState[key][index])),
                        } });
                    return state;
                });
            }
        }
        else {
            if (!formErrors[key]) {
                setFormErrors((errors) => (Object.assign(Object.assign({}, errors), { [key]: { error: null } })));
            }
        }
    };
    const actions = useMemo(() => {
        const map = {};
        Object.keys(initialValues).forEach((key) => {
            const typedKey = key;
            if (Array.isArray(initialValues[typedKey])) {
                map[typedKey] = createArrayActions([
                    (item) => {
                        const updatedFormState = Object.assign(Object.assign({}, formState), { [typedKey]: addItemAtIndex(formState[typedKey], item) });
                        clearError(typedKey, updatedFormState);
                        setFormState(updatedFormState);
                    },
                    (index, item) => {
                        const updatedFormState = Object.assign(Object.assign({}, formState), { [typedKey]: updateItemAtIndex(formState[typedKey], index, item) });
                        clearError(typedKey, updatedFormState);
                        setFormState(updatedFormState);
                    },
                    (index) => {
                        const updatedFormState = Object.assign(Object.assign({}, formState), { [typedKey]: removeItemAtIndex(formState[typedKey], index) });
                        clearError(typedKey, updatedFormState);
                        setFormState(updatedFormState);
                    },
                ]);
            }
            else {
                map[typedKey] = {
                    update: (payload) => {
                        const updatedFormState = Object.assign(Object.assign({}, formState), { [typedKey]: payload.value });
                        clearError(typedKey, updatedFormState);
                        setFormState(updatedFormState);
                    },
                };
            }
        });
        return map;
    }, [initialValues, setFormState, formState]);
    const validate = useCallback(() => {
        const validateForms = (validation, formState) => {
            const errors = {};
            Object.entries(validation).forEach(([key, validator]) => {
                const typedKey = key;
                const typedValue = validator;
                if (typeof typedValue !== "function") {
                    const typedValidator = typedValue === null || typedValue === void 0 ? void 0 : typedValue.validator;
                    const error = typedValidator(formState[typedKey], formState);
                    if (!typedValue) {
                        errors[typedKey] = { error };
                        return;
                    }
                    const fieldValidators = typedValue.fields;
                    const fieldErrors = [];
                    Object.keys(formState[typedKey]).forEach((_, index) => {
                        fieldErrors.push(validateForms(fieldValidators, formState[typedKey][index]));
                    });
                    errors[typedKey] = {
                        error,
                        fieldErrors,
                    };
                    return;
                }
                const typedValidator = typedValue;
                const error = typedValidator(formState[typedKey], formState);
                errors[typedKey] = { error };
            });
            return Object.assign(Object.assign({}, createFormErrorMap(formState)), errors);
        };
        if (validation) {
            const errors = validateForms(validation, formState);
            setFormErrors((errorsState) => (Object.assign(Object.assign({}, errorsState), errors)));
            return Object.values(errors).some((error) => error);
        }
    }, [validation, formErrors, setFormErrors, formState]);
    const onSubmit = (event, func) => {
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
