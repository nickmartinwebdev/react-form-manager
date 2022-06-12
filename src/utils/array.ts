export const addItemAtIndex = <T>(array: T[], item: T, index?: number): T[] => {
  const newArray = [...array];
  index != undefined ? newArray.splice(index, 0, item) : newArray.push(item);

  return newArray;
};

export const removeItemAtIndex = <T>(array: T[], index: number): T[] => {
  const newArray = [...array];
  newArray.splice(index);
  return newArray;
};

export const updateItemAtIndex = <T>(
  array: T[],
  index: number,
  item: T
): T[] => {
  const newArray = [...array];
  newArray.splice(index, 1, item);
  return newArray;
};
