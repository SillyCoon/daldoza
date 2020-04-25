export const EnumGenerator = {
  generate(...args) {
    const result = {};
    args.forEach((arg, i) => {
      result[arg] = i;
    });
    Object.freeze(result);
    return result;
  },
};
