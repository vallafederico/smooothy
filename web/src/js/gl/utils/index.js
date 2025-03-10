export function findGroup(obj) {
  if (obj.isGroup === true) {
    return obj;
  }

  for (const key in obj) {
    if (typeof obj[key] === "object") {
      const result = findGroup(obj[key]);
      if (result) {
        return result;
      }
    }
  }

  return null;
}

export function handleResize(container, cb) {
  new ResizeObserver((entry) => cb(entry[0].contentRect)).observe(container);
}
