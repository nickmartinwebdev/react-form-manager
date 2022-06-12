export const addItemAtIndex = (array, item, index) => {
    const newArray = [...array];
    index != undefined ? newArray.splice(index, 0, item) : newArray.push(item);
    return newArray;
};
export const removeItemAtIndex = (array, index) => {
    const newArray = [...array];
    newArray.splice(index, 1);
    return newArray;
};
export const updateItemAtIndex = (array, index, item) => {
    const newArray = [...array];
    newArray.splice(index, 1, item);
    return newArray;
};
