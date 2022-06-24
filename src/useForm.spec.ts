import { act, renderHook } from "@testing-library/react";
import { it, expect } from "vitest";

import { useForm } from "./useFormNew";

it("should return field values from initial values", () => {
  const initialValues = {
    object: {
      property1: "property 1",
      objectproperty: {
        property2: "property 2",
      },
    },
    string: "string",
    number: 10,
    boolean: true,
    objectArray: [{ property3: "property 3" }],
    primitiveArray: ["string"],
    emptyArray: [] as string[],
  };

  const { result } = renderHook(() =>
    useForm({
      initialValues,
    })
  );

  console.log(result.current.fields);

  expect(result.current.fields.string.value).toBe("string");
  expect(result.current.fields.number.value).toBe(10);
  expect(result.current.fields.boolean.value).toBe(true);
  expect(result.current.fields.object.value).toMatchObject({
    property1: "property 1",
    objectproperty: {
      property2: "property 2",
    },
  });
  expect(result.current.fields.objectArray.value).toMatchObject([
    { property3: "property 3" },
  ]);
  expect(result.current.fields.primitiveArray.value).toMatchObject(["string"]);
  expect(result.current.fields.emptyArray.value).toMatchObject([]);

  // expect(result.current.fields.object.fields.property1.value).toBe(
  //   "property 1"
  // );
});
