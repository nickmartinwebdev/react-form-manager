import { act, renderHook } from "@testing-library/react";
import { it, expect } from "vitest";

import { useForm } from "./useFormNew";

it("should return initial values as values", () => {

  const initialValues = {
    name: [{
      first: 'hey',
      last: ''
    }]
  }

  const { result } = renderHook(() => useForm({
    initialValues,
    conditionalValues: {
      name: {
        conditional: {
          pleaseWork: (values) => values.name[0].first === ''
        }
      }
    }
  }))

  console.log(result.current.fields.name)

  expect(result.current.fields.name.value).toMatchObject([{ first: '', last: '' }])
});
