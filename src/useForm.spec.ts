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

});


describe('tests for dispatching actions', () => {

  it('should dispatch default and described actions for primitive fields', () => {

    const initialValues = {
      property: "initial",
    };

    const { result } = renderHook(() =>
      useForm({
        initialValues,
        computedValues: {},
        submit: {},
        actions: {
          property: {
            actions: {
              uppercase: (setState, state) => () => { setState(state.toUpperCase()) }
            }
          }
        }
      })
    );

    expect(result.current.fields.property.dispatch).toBeDefined()

    act(() => {
      result.current.fields.property.dispatch({ action: 'update', payload: 'updated' })
    })

    expect(result.current.fields.property.value).toBe('updated')

    act(() => {
      result.current.fields.property.dispatch({ action: 'uppercase' })
    })

    expect(result.current.fields.property.value).toBe('UPDATED')

  })

  it('should dispatch default and described actions for object fields', () => {

    const initialValues = {
      property: {
        nestedField: 'initial',
        nestedObject: {
          deeperNestedField: 'initial'
        }
      }
    };

    const { result } = renderHook(() =>
      useForm({
        initialValues,
        computedValues: {},
        submit: {},
        actions: {
          property: {
            actions: {
              reset: (setState) => () => {
                setState({
                  nestedField: 'initial',
                  nestedObject: { deeperNestedField: 'initial' }
                })
              }
            },
            fields: {
              nestedObject: {
                fields: {
                  deeperNestedField: {
                    actions: {
                      setToHappy: (setState) => () => { setState('happy') }
                    }
                  }
                }
              }
            }
          }
        }
      })
    );

    expect(result.current.fields.property.dispatch).toBeDefined()

    act(() => {
      result.current.fields.property.dispatch({
        action: 'update',
        payload: {
          nestedField: 'updated',
          nestedObject: { deeperNestedField: 'updated' }
        }
      })
    })

    expect(result.current.fields.property.value).toMatchObject({
      nestedField: 'updated',
      nestedObject: { deeperNestedField: 'updated' }
    })

    act(() => {
      result.current.fields.property.dispatch({
        action: 'reset',
      })
    })

    expect(result.current.fields.property.value).toMatchObject({
      nestedField: 'initial',
      nestedObject: { deeperNestedField: 'initial' }
    })

    expect(result.current.fields.property.fields.nestedObject.fields.deeperNestedField.dispatch).toBeDefined()

    act(() => {
      result.current.fields.property.fields.nestedObject.fields.deeperNestedField.dispatch(
        { action: 'update', payload: 'updated' })
    })

    expect(result.current.fields.property.fields.nestedObject.fields.deeperNestedField.value).toBe('updated')

    act(() => {
      result.current.fields.property.fields.nestedObject.fields.deeperNestedField.dispatch(
        { action: 'setToHappy', })
    })

    expect(result.current.fields.property.fields.nestedObject.fields.deeperNestedField.value).toBe('happy')

  })

  it('should dispatch default and described actions for array object fields', () => {

    const initialValues = {
      property: [{ field: 'initial' }]
    };

    const { result } = renderHook(() =>
      useForm({
        initialValues,
        computedValues: {},
        submit: {},
        actions: {
          property: {
            actions: {
              addItem: (setState, state) => (item: typeof state[number]) => { setState([...state, item]) }
            },
            fields: {
              field: {
                actions: {
                  uppercase: (setState, state) => () => { setState(state.toUpperCase()) }
                }
              }
            }
          }
        }
      })
    );

    expect(result.current.fields.property.dispatch).toBeDefined()

    act(() => {
      result.current.fields.property.dispatch({ action: 'update', payload: [] })
    })

    expect(result.current.fields.property.value).toMatchObject([])

    act(() => {
      result.current.fields.property.dispatch({ action: 'addItem', payload: { field: 'new item' } })
    })

    expect(result.current.fields.property.value).toMatchObject([{ field: 'new item' }])
    expect(result.current.fields.property.items[0].dispatch).toBeDefined()

    act(() => {
      result.current.fields.property.items[0].dispatch({ action: 'update', payload: { field: 'updated item' } })
    })

    expect(result.current.fields.property.value).toMatchObject([{ field: 'updated item' }])
    expect(result.current.fields.property.items[0].fields.field.dispatch).toBeDefined()

    act(() => {
      result.current.fields.property.items[0].fields.field.dispatch({ action: 'update', payload: 'updated' })
    })

    expect(result.current.fields.property.items[0].fields.field.value).toBe('updated')

    act(() => {
      result.current.fields.property.items[0].fields.field.dispatch({ action: 'uppercase' })
    })

    expect(result.current.fields.property.items[0].value).toMatchObject({ field: 'UPDATED' })

  })

  it('should dispatch default and described actions for primitive array fields', () => {

    const initialValues = {
      property: ['first']
    };

    const { result } = renderHook(() =>
      useForm({
        initialValues,
        computedValues: {},
        submit: {},
        actions: {
          property: {
            actions: {
              addItem: (setState, state) => (item: typeof state[number]) => { setState([...state, item]) }
            },
          }
        }
      })
    );

    expect(result.current.fields.property.dispatch).toBeDefined()

    act(() => {

      result.current.fields.property.dispatch({ action: 'update', payload: ['first', 'second'] })
    })

    expect(result.current.fields.property.value).toMatchObject(['first', 'second'])

    act(() => {
      result.current.fields.property.dispatch({ action: 'addItem', payload: 'third' })
    })

    expect(result.current.fields.property.value).toMatchObject(['first', 'second', 'third'])
  })

})
