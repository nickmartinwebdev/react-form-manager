import { useState } from "react"

import { ConditionalValues, SubmitFuncMap, ValidationValues, FormData, ConditionalValueResults, DropEmpty } from "./types"

interface Props<T, R extends ConditionalValues<T, T>, S extends SubmitFuncMap<T>> {
    initialValues: T,
    conditionalValues?: R,
    validation?: ValidationValues<T>,
    submit?: S
}


const createFormData = <T, R extends ConditionalValues<T, T>, S extends SubmitFuncMap<T>>(state: T, conditionalMap: R): FormData<T, R, S> => {

    const formData: Partial<FormData<T, R, S>> = {}

    Object.entries(state).forEach(([key, value]) => {
        const typedKey = key as keyof T;
        const typedValue = value as T[keyof T]

        // If value is an array
        if (Array.isArray(typedValue)) {
            if (typeof typedValue === 'object') {
                const conditionalValues: Partial<ConditionalValueResults<
                    T[keyof T],
                    T,
                    ConditionalValues<T[keyof T], T>>> = {}

                if (conditionalMap[typedKey]) {
                    Object.entries(conditionalMap[typedKey]['conditional']).forEach(([cKey, cValue]) => {
                        const typedCKey = cKey as keyof R[keyof T]['conditional']
                        const typedCValue = cValue as R[keyof T]['conditional'][typeof typedCKey]
                        const cResult = typedCValue(state)
                        conditionalValues[typedCKey] = cResult
                    })
                }

                // Need to drop properties conditional values and submit if required
                const possiblyEmpty = {
                    conditionalValues: conditionalValues as ConditionalValueResults<
                        T[keyof T],
                        T,
                        ConditionalValues<T[keyof T], T>>
                } as DropEmpty<{
                    conditionalValues: ConditionalValueResults<
                        T[keyof T],
                        T,
                        ConditionalValues<T[keyof T], T>>
                }>

                formData[typedKey] = {
                    value: state[typedKey],
                    error: null,
                    ...possiblyEmpty,
                    items: [],
                } as FormData<T, R, S>[keyof T]
            }
        }
    })

    return formData as FormData<T, R, S>

}

export const useForm = <
    T,
    R extends ConditionalValues<T, T>,
    S extends SubmitFuncMap<T>>(props: Props<T, R, S>) => {

    const { initialValues, conditionalValues = {}, validation, submit } = props

    const [state, setState] = useState<T>(initialValues)
    const [errorMap, setErrorMap] = useState<{}>({})

    const form: FormData<T, R, S> = createFormData(state, conditionalValues)

    return {
        fields: form
    }
}






