import { act, renderHook } from "@testing-library/react";
import { it, expect, describe } from "vitest";

import { useForm } from ".";

describe('tests for dispatching actions', () => {

  it('should dispatch default and described actions for primitive fields', () => {

    const initialValues = {
      property: "initial",
    };

    const { result } = renderHook(() =>
      useForm({
        initialValues,
        computedValues: {},
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
