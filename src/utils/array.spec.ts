import { it, expect } from "vitest";
import { addItemAtIndex, removeItemAtIndex, updateItemAtIndex } from "./array";

it("should add item to end of array", () => {
  const result = addItemAtIndex([{ item: "test 1" }, { item: "test 2" }], {
    item: "test 3",
  });
  expect(result).toMatchObject([
    { item: "test 1" },
    { item: "test 2" },
    { item: "test 3" },
  ]);
});

it("should insert item at correct index in array", () => {
  const result = addItemAtIndex(
    [{ item: "test 1" }, { item: "test 2" }],
    {
      item: "test 3",
    },
    1
  );
  expect(result).toMatchObject([
    { item: "test 1" },
    { item: "test 3" },
    { item: "test 2" },
  ]);
});

it("should update item at correct index in array", () => {
  const result = updateItemAtIndex(
    [{ item: "test 1" }, { item: "test 2" }],
    1,
    {
      item: "test 3",
    }
  );
  expect(result).toMatchObject([{ item: "test 1" }, { item: "test 3" }]);
});

it("should remove item at correct index in array", () => {
  const result = removeItemAtIndex([{ item: "test 1" }, { item: "test 2" }], 0);
  expect(result).toMatchObject([{ item: "test 2" }]);
});
