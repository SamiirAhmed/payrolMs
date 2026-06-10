export function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function paginate(list, page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize;
  return list.slice(start, start + pageSize);
}

export function sortBy(list, key, direction = "asc") {
  if (!key) return list;

  return [...list].sort((a, b) => {
    const first = a[key];
    const second = b[key];

    if (typeof first === "number" && typeof second === "number") {
      return direction === "asc" ? first - second : second - first;
    }

    return direction === "asc"
      ? String(first).localeCompare(String(second))
      : String(second).localeCompare(String(first));
  });
}

export function filterByQuery(items, query, fields) {
  if (!query) return items;
  const search = query.toLowerCase();
  return items.filter((item) =>
    fields.some((field) => String(item[field] ?? "").toLowerCase().includes(search))
  );
}

export function initials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
