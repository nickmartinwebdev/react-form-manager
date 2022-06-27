import { act, renderHook } from "@testing-library/react";
import { it, expect } from "vitest";

import { useForm } from ".";

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

it("should correctly evaluate any computed values", () => {
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
      computedValues: {
        object: {
          computed: {
            test: (value) => value.property1,
          },
          fields: {
            property1: {
              computed: {
                test2: (_, values) => {
                  return values.string === "string";
                },
              },
            },
          },
        },
        objectArray: {
          fields: {
            property3: {
              computed: {
                test3: () => 10,
              },
            },
          },
        },
        string: {
          computed: {},
        },
      },
    })
  );

  expect(result.current.fields.object.computedValues.test).toBe("property 1");
  expect(
    result.current.fields.object.fields.property1.computedValues.test2
  ).toBe(true);
  expect(result.current.fields.object.fields.objectproperty).not.toHaveProperty(
    "computedValues"
  );
  expect(result.current.fields.objectArray).not.toHaveProperty(
    "computedValues"
  );
  expect(
    result.current.fields.objectArray.items[0].fields.property3.computedValues
      .test3
  ).toBe(10);
  expect(result.current.fields.string).not.toHaveProperty("computedValues");
});

it("should correctly dispatch any actions", () => {
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
      actions: {
        object: {
          actions: {
            update: (setState, state) => (newState: typeof state) => {
              setState(newState);
            },
          },
          fields: {
            property1: {
              actions: {
                upperCase: (setState, state) => () => {
                  setState(state.toUpperCase());
                },
                lowerCase: (setState, state) => () => {
                  setState(state.toLowerCase());
                },
              },
            },
          },
        },
      },
    })
  );

  expect(result.current.fields.object.fields.property1.dispatch).toBeDefined();

  act(() => {
    result.current.fields.object.dispatch({
      action: "update",
      payload: {
        objectproperty: {
          property2: "new property",
        },
        property1: "prop 1",
      },
    });
  });

  expect(result.current.fields.object.value).toMatchObject({
    objectproperty: {
      property2: "new property",
    },
    property1: "prop 1",
  });
});
