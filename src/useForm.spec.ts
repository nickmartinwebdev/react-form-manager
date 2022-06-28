import { act, renderHook } from "@testing-library/react";
import { it, expect, describe } from "vitest";

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

describe("tests for dispatching actions", () => {
  it("should have dispatch function available", () => {
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
      })
    );

    expect(result.current.fields.object.dispatch).toBeDefined();
    expect(
      result.current.fields.object.fields.property1.dispatch
    ).toBeDefined();
    expect(result.current.fields.objectArray.dispatch).toBeDefined();
    expect(
      result.current.fields.objectArray.items[0].fields.property3.dispatch
    ).toBeDefined();
    expect(result.current.fields.objectArray.items[0].dispatch).toBeDefined();
    expect(result.current.fields.primitiveArray.dispatch).toBeDefined();
    expect(result.current.fields.string.dispatch).toBeDefined();
  });

  it("should dispatch default update actions", () => {
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
      })
    );

    act(() => {
      result.current.fields.string.dispatch({
        action: "update",
        payload: "updated string",
      });
    });

    expect(result.current.fields.string.value).toBe("updated string");

    act(() => {
      result.current.fields.object.dispatch({
        action: "update",
        payload: {
          property1: "test value 1",
          objectproperty: {
            property2: "test value 2",
          },
        },
      });
    });

    expect(result.current.fields.object.value).toMatchObject({
      property1: "test value 1",
      objectproperty: {
        property2: "test value 2",
      },
    });

    act(() => {
      result.current.fields.object.fields.property1.dispatch({
        action: "update",
        payload: "test value 1 new",
      });
    });

    expect(result.current.fields.object.fields.property1.value).toBe(
      "test value 1 new"
    );

    act(() => {
      result.current.fields.objectArray.dispatch({
        action: "update",
        payload: [{ property3: "property 3" }, { property3: "property 3 new" }],
      });
    });

    expect(result.current.fields.objectArray.value).toMatchObject([
      { property3: "property 3" },
      { property3: "property 3 new" },
    ]);

    act(() => {
      result.current.fields.objectArray.items[1].dispatch({
        action: "update",
        payload: { property3: "updated" },
      });
    });

    expect(result.current.fields.objectArray.items[1].value).toMatchObject({
      property3: "updated",
    });

    act(() => {
      result.current.fields.objectArray.items[1].fields.property3.dispatch({
        action: "update",
        payload: "updated 2",
      });
    });

    expect(
      result.current.fields.objectArray.items[1].fields.property3.value
    ).toBe("updated 2");
  });
});
