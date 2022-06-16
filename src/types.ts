import { updateItemAtIndex } from "./utils/array";

type Data<T> = {
  update: (payload: ((value: T) => T) | T) => void;
  error: string | null;
  value: T;
  visible: boolean;
};

type ArrayData<T, U> = Data<T> & { fields: Data<U>[] };

type RecordArrayData<T, U> = Data<T> & {
  fields: ({ fields: DataMap<U> } & Exclude<Data<U>, "visible">)[];
};

type RecordData<T> = Data<T> & { fields: DataMap<T> };

type DataMap<T extends Record<string, any>> = {
  [Key in keyof T]: T[Key] extends Array<infer U>
    ? U extends Record<string, any>
      ? RecordArrayData<T[Key], U>
      : ArrayData<T[Key], U>
    : T[Key] extends Record<string, any>
    ? RecordData<T[Key]>
    : Data<T[Key]>;
};

type ActiveFunc<T> = (values: T) => boolean;

export type ActiveMap<
  T extends Record<string, any>,
  U extends Record<string, any> = T
> = {
  [Key in keyof T]?: T[Key] extends Array<infer V>
    ? V extends Record<string, any>
      ? { visibility?: ActiveFunc<U>; fields?: ActiveMap<V, U> }
      : { visibility?: ActiveFunc<U> }
    : T[Key] extends Record<string, any>
    ? { visibility?: ActiveFunc<U>; fields?: ActiveMap<T[Key], U> }
    : { visibility?: ActiveFunc<U> };
};

type ActiveMapState<T> = {
  [Key in keyof T]: T[Key] extends Array<infer U>
    ? U extends Record<string, any>
      ? {
          active: boolean;
        } & ActiveMapState<U>
      : { active: boolean }
    : T[Key] extends Record<string, any>
    ? { active: boolean } & ActiveMapState<T[Key]>
    : { active: boolean };
};
export const createDataMap = <T>(
  state: T,
  setState: (state: T) => void,
  activeMap: ActiveMap<T>
): DataMap<T> => {
  const dataMap: Partial<DataMap<T>> = {};
  Object.entries(state).forEach(([key, value]) => {
    const typedKey = key as keyof T;
    const typedValue = value as T[keyof T];

    if (Array.isArray(typedValue)) {
      dataMap[typedKey] = {
        error: null,
        value: state[typedKey],
        update: (payload) => {
          if (typeof payload === "function") {
            const typedPayload = payload as (value: T[keyof T]) => T[keyof T];
            setState({ ...state, [typedKey]: typedPayload(state[typedKey]) });
          } else {
            const typedPayload = payload as T[keyof T];
            setState({ ...state, [typedKey]: typedPayload });
          }
        },
        visible: activeMap[typedKey]
          ? activeMap[typedKey].visibility
            ? activeMap[typedKey].visibility(state)
            : true
          : true,
        fields: typedValue.map((value, index) => {
          const typedArrayValue = value as typeof typedValue[number];
          if (typeof typedArrayValue === "object") {
            return {
              fields: createDataMap<typeof typedArrayValue>(
                state[typedKey][index],
                (newState: typeof typedArrayValue) =>
                  setState({
                    ...state,
                    [typedKey]: updateItemAtIndex(typedValue, index, newState),
                  }),
                activeMap[typedKey] || {}
              ),
              update: (payload) => {
                if (typeof payload === "function") {
                  const typedPayload = payload as (
                    value: typeof typedArrayValue
                  ) => typeof typedArrayValue;
                  setState({
                    ...state,
                    [typedKey]: typedPayload(state[typedKey]),
                  });
                } else {
                  const typedPayload = payload as typeof typedArrayValue;
                  setState({ ...state, [typedKey]: typedPayload });
                }
              },
              error: null,
              value: state[typedKey][index],
            };
          } else {
            return {
              error: null,
              value: state[typedKey][index],
              update: (payload) => {
                if (typeof payload === "function") {
                  const typedPayload = payload as (
                    value: typeof typedArrayValue
                  ) => typeof typedArrayValue;
                  setState({
                    ...state,
                    [typedKey]: updateItemAtIndex(
                      typedValue,
                      index,
                      typedPayload(state[typedKey][index])
                    ),
                  });
                } else {
                  const typedPayload = payload as typeof typedArrayValue;
                  setState({
                    ...state,
                    [typedKey]: updateItemAtIndex(
                      typedValue,
                      index,
                      typedPayload
                    ),
                  });
                }
              },
            };
          }
        }),
      } as DataMap<T>[keyof T];
    } else if (typeof typedValue === "object") {
      dataMap[typedKey] = {
        error: null,
        value: state[typedKey],
        update: (payload) => {
          if (typeof payload === "function") {
            const typedPayload = payload as (value: T[keyof T]) => T[keyof T];
            setState({ ...state, [typedKey]: typedPayload(state[typedKey]) });
          } else {
            const typedPayload = payload as T[keyof T];
            setState({ ...state, [typedKey]: typedPayload });
          }
        },
        visible: activeMap[typedKey]
          ? activeMap[typedKey].visibility &&
            activeMap[typedKey].visibility(state)
          : false,
        fields: createDataMap<T[keyof T]>(
          state[typedKey],
          (nextState: T[keyof T]) =>
            setState({ ...state, [typedKey]: nextState }),
          activeMap[typedKey] || {}
        ),
      } as DataMap<T>[keyof T];
    } else {
      dataMap[typedKey] = {
        error: null,
        value: state[typedKey],
        update: (payload) => {
          if (typeof payload === "function") {
            const typedPayload = payload as (value: T[keyof T]) => T[keyof T];
            setState({ ...state, [typedKey]: typedPayload(state[typedKey]) });
          } else {
            const typedPayload = payload as T[keyof T];
            setState({ ...state, [typedKey]: typedPayload });
          }
        },
        visible: activeMap[typedKey]
          ? activeMap[typedKey].visibility &&
            activeMap[typedKey].visibility(state)
          : false,
      } as DataMap<T>[keyof T];
    }
  });
  return dataMap as DataMap<T>;
};
