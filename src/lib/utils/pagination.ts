export function generatePagination(
  currentPage: number,
  totalPages: number,
  delta: number = 1,
): (number | "...")[] {
  const range: number[] = [];
  const pages: (number | "...")[] = [];

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= delta) {
      range.push(i);
    }
  }

  let last: number | undefined;
  for (const i of range) {
    if (last !== undefined && i - last > 1) {
      pages.push("...");
    }
    pages.push(i);
    last = i;
  }

  return pages;
}
