import { get } from "../utils/request";

export async function getBooksInSeries(seriesId, queryParams = {}) {
  const { page = 0, size = 100, sort = "name,asc" } = queryParams;

  const response = await get(`/api/v1/series/${seriesId}/books`, {
    params: {
      page,
      size,
      sort,
    },
  });
  return response.data;
}

export async function getBookById(bookId) {
  const response = await get(`/api/v1/books/${bookId}`);
  return response.data;
}

export async function getBookPagesById(bookId) {
  const response = await get(`/api/v1/books/${bookId}/pages`);
  return response.data;
}

export function getBookPagePreview(bookId, pageIndex) {
  return `${
    import.meta.env.VITE_KOMGA_ENDPOINT
  }/api/v1/books/${bookId}/pages/${pageIndex}/thumbnail`;
}

export function getBookPageUrl(bookId, pageIndex) {
  return `${
    import.meta.env.VITE_KOMGA_ENDPOINT
  }/api/v1/books/${bookId}/pages/${pageIndex}`;
}
