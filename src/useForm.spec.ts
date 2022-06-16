import { act, renderHook } from "@testing-library/react";
import { it, expect } from "vitest";

import { useForm } from "./useFormNew";

it("should have the correct properties for primitive values", () => {
  const initialValues = {
    name: "",
    age: 0,
  };

  const { result } = renderHook(() => useForm({ initialValues }));

  const { name, age } = result.current.fields;

  expect(name).toHaveProperty("update");
  expect(name).toHaveProperty("error");
  expect(name).toHaveProperty("value");
  expect(name.value).toBe("");
  expect(name.error).toBe(null);

  expect(age).toHaveProperty("update");
  expect(age).toHaveProperty("error");
  expect(age).toHaveProperty("value");
  expect(age.value).toBe(0);
  expect(age.error).toBe(null);
});

it("should have the correct properties for object values", () => {
  const initialValues = {
    details: {
      name: "",
      age: 0,
    },
  };

  const { result } = renderHook(() => useForm({ initialValues }));

  const { details } = result.current.fields;

  expect(details).toHaveProperty("update");
  expect(details).toHaveProperty("error");
  expect(details).toHaveProperty("value");
  expect(details.value).toMatchObject({ name: "", age: 0 });
  expect(details.error).toBe(null);
  expect(details).toHaveProperty("fields");
  expect(details.fields).toHaveProperty("name");
  expect(details.fields.name).toHaveProperty("update");
});

it("should have the correct properties for object array values", () => {
  const initialValues = {
    details: [{ name: "", age: 0 }],
  };

  const { result } = renderHook(() =>
    useForm({
      initialValues,
    })
  );

  const { details } = result.current.fields;

  expect(details).toHaveProperty("update");
  expect(details).toHaveProperty("error");
  expect(details).toHaveProperty("value");
  expect(details.value).toMatchObject([{ name: "", age: 0 }]);
  expect(details.error).toBe(null);
  expect(details).toHaveProperty("fields");
  expect(details.fields).toHaveLength(1);
  expect(details.fields[0]).toHaveProperty("update");
  expect(details.fields[0]).toHaveProperty("error");
  expect(details.fields[0]).toHaveProperty("value");
  expect(details.fields[0]).toHaveProperty("fields");
  expect(details.fields[0].fields).toHaveProperty("name");
  expect(details.fields[0].fields).toHaveProperty("age");
  expect(details.fields[0].fields.name).toHaveProperty("update");
  expect(details.fields[0].fields.name).toHaveProperty("error");
  expect(details.fields[0].fields.name).toHaveProperty("value");
});

it("should have the correct properties for primitive array values", () => {
  const initialValues = {
    details: [0, 1],
  };

  const { result } = renderHook(() => useForm({ initialValues }));

  const { details } = result.current.fields;

  expect(details).toHaveProperty("update");
  expect(details).toHaveProperty("error");
  expect(details).toHaveProperty("value");
  expect(details.value).toMatchObject([0, 1]);
  expect(details.error).toBe(null);
  expect(details).toHaveProperty("fields");
  expect(details.fields).toHaveLength(2);
  expect(details.fields[0]).toHaveProperty("update");
  expect(details.fields[0]).toHaveProperty("error");
  expect(details.fields[0]).toHaveProperty("value");
  expect(details.fields[0]).not.toHaveProperty("fields");
});
