import { act, renderHook } from "@testing-library/react";
import { it, expect } from "vitest";

import { useForm } from ".";

it("should return initial values as values", () => {
  const initialValues = {
    name: { text: '' },
    age: 0,
  };

  const { result } = renderHook(() => useForm({
    initialValues, active: {
      name: {
        fields: {
          text: {
            name: (a) => !!a.name.text
          }
        }
      }
    }
  }));

  result.current.fields.name.callbacks

  expect(result.current.values).toMatchObject(initialValues);
});



it("should have the correct properties for object values", () => {
  const initialValues = {
    age: 0,
    description: "",
    questions: [{ text: "", answer: "" }],
  };
  const { result } = renderHook(() => useForm({ initialValues }));

  expect(result.current.actions.description).toHaveProperty("update");
  expect(result.current.actions.age).toHaveProperty("update");

  act(() => {
    result.current.actions.description.update({ value: "updated description" });
  });

  act(() => {
    result.current.actions.age.update({ value: 10 });
  });

  expect(result.current.values).toMatchObject({
    age: 10,
    description: "updated description",
    questions: [{ text: "", answer: "" }],
  });
});

it("calling actions for array values should update form state accordingly", () => {
  const initialValues = {
    age: 0,
    description: "",
    questions: [{ text: "", answer: "" }],
  };
  const { result } = renderHook(() => useForm({ initialValues }));

  expect(result.current.actions.questions).toHaveProperty("addItem");
  expect(result.current.actions.questions).toHaveProperty("updateItem");
  expect(result.current.actions.questions).toHaveProperty("removeItem");

  act(() => {
    result.current.actions.questions.addItem({
      item: { text: "new question", answer: "correct" },
    });
  });

  expect(result.current.values.questions).toMatchObject([
    { text: "", answer: "" },
    { text: "new question", answer: "correct" },
  ]);

  act(() => {
    result.current.actions.questions.updateItem({
      item: { text: "updated question", answer: "also correct" },
      index: 0,
    });
  });

  expect(result.current.values.questions).toMatchObject([
    { text: "updated question", answer: "also correct" },
    { text: "new question", answer: "correct" },
  ]);

  act(() => {
    result.current.actions.questions.removeItem({
      index: 0,
    });
  });

  expect(result.current.values.questions).toMatchObject([
    { text: "new question", answer: "correct" },
  ]);
});
