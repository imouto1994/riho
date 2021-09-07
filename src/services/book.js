import { get, put } from "../utils/request";

export async function getBooksInTitle(titleId) {
  const response = await get(`/api/title/${titleId}/books`);
  return response.data;
}

export async function getBookById(bookId) {
  const response = await get(`/api/book/${bookId}`);
  return response.data;
}

export async function getBookPagesById(bookId) {
  const response = await get(`/api/book/${bookId}/pages`);
  return response.data;
}

export async function getBookPreviewsById(bookId) {
  const response = await get(`/api/book/${bookId}/previews`);
  return response.data;
}

export async function updateBookPageFavorite(bookId, pageNumber, favorite) {
  const response = await put(
    `/api/book/${bookId}/page/${pageNumber}/favorite`,
    { favorite },
  );
  return response.data;
}

export function getBookPageURL(bookId, pageIndex) {
  return `${
    import.meta.env.VITE_YUME_ENDPOINT
  }/api/book/${bookId}/page/${pageIndex}`;
}

export function getBookPreviewURL(bookId, previewIndex) {
  return `${
    import.meta.env.VITE_YUME_ENDPOINT
  }/api/book/${bookId}/preview/${previewIndex}`;
}
