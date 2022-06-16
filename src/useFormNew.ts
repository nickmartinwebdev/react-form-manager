import { useState, useMemo } from "react";
import { ActiveMap, createDataMap } from "./types";

interface Props<T> {
  initialValues: T;
  active?: ActiveMap<T>;
}

export const useForm = <T>(props: Props<T>) => {
  const { initialValues, active = {} } = props;

  const [formState, setFormState] = useState(initialValues);

  const fields = useMemo(
    () => createDataMap(formState, (state) => setFormState(state), active),
    [formState, setFormState]
  );

  return { fields };
};
