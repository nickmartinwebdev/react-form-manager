import { FormEvent } from "react";
export declare type ObjectError<T> = {
    [Key in keyof T]: {
        error: string | null;
    };
};
declare type Validator<T, U> = (value: T, values: U) => string | null;
declare type ValidatorMap<T extends {
    [k: string]: any;
}> = {
    [Key in keyof T]?: T[Key] extends (infer U)[] ? {
        validator: Validator<T[Key], T>;
        fields: ValidatorMap<U>;
    } : Validator<T[Key], T>;
};
interface Props<T extends Record<string, any>> {
    initialValues: T;
    validation?: ValidatorMap<T>;
}
declare type ArrayActions<T> = {
    addItem: (payload: {
        item: T;
    }) => void;
    updateItem: (payload: {
        index: number;
        item: T;
    }) => void;
    removeItem: (payload: {
        index: number;
    }) => void;
};
declare type Actions<T> = {
    update: (payload: {
        value: T;
    }) => void;
};
declare type ActionCreatorMap<T> = {
    [Key in keyof T]: T[Key] extends Array<any> ? ArrayActions<T[Key][number]> : Actions<T[Key]>;
};
declare type FormErrorMap<T extends Record<string, any>> = {
    [Key in keyof T]: T[Key] extends Array<infer U> ? U extends Record<string, any> ? {
        error: string | null;
        fieldErrors: FormErrorMap<U>[];
    } : {
        error: string | null;
        fieldErrors: (string | null)[];
    } : {
        error: string;
    };
};
export declare const useForm: <T extends Record<string, any>>(props: Props<T>) => {
    errors: FormErrorMap<T>;
    values: T;
    actions: ActionCreatorMap<T>;
    onSubmit: (event: FormEvent, func: (values: T) => void) => boolean;
    validate: () => boolean;
    reset: () => void;
};
export {};
