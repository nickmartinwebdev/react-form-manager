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

  // testing existance of top level values
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

  // testing existance of nested object values
  expect(result.current.fields.object.fields.property1.value).toBe(
    "property 1"
  );
  expect(
    result.current.fields.object.fields.objectproperty.fields.property2.value
  ).toBe("property 2");

  // testing existance of array item values
  expect(result.current.fields.primitiveArray.items[0].value).toBe("string");
});

it("should correctly evaluate any conditional values", () => {
  const initialValues = {
    object: {
      property1: "property 1",
      objectproperty: {
        property2: "property 2",
      },
    },
    objectArray: [{ property3: "property 3" }],
    primitiveArray: ["string"],
    string: "string",
  };

  const { result } = renderHook(() =>
    useForm({
      initialValues,
      conditionalValues: {
        object: {
          conditional: {
            test: (value) => value.property1,
          },
          fields: {
            property1: {
              conditional: {
                test2: (_, values) => {
                  console.log(values);
                  return values.string === "string";
                },
              },
            },
          },
        },
        objectArray: {
          fields: {
            property3: {
              conditional: {
                test3: () => 10,
              },
            },
          },
        },
        string: {
          conditional: {},
        },
      },
    })
  );

  console.log("hey", result.current.fields);

  expect(result.current.fields.object.conditionalValues.test).toBe(
    "property 1"
  );
  expect(
    result.current.fields.object.fields.property1.conditionalValues.test2
  ).toBe(true);
  expect(result.current.fields.object.fields.objectproperty).not.toHaveProperty(
    "conditionalValues"
  );
  expect(result.current.fields.objectArray).not.toHaveProperty(
    "conditionalValues"
  );
  expect(
    result.current.fields.objectArray.items[0].fields.property3
      .conditionalValues.test3
  ).toBe(10);
  expect(result.current.fields.string).not.toHaveProperty("conditionalValues");
});
