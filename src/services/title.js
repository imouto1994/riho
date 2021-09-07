import { get, post } from "../utils/request";

export async function getTitles(queryParams = {}) {
  const {
    libraryId,
    page = 0,
    search,
    size = 24,
    sort = "created_at",
  } = queryParams;

  const response = await get("/api/title", {
    params: {
      library_id: libraryId,
      page,
      search,
      size,
      sort,
    },
  });
  return response.data;
}

export async function countTitles(queryParams = {}) {
  const { libraryId, search } = queryParams;

  const response = await get("/api/title/count", {
    params: {
      library_id: libraryId,
      search,
    },
  });
  return response.data;
}

export async function getTitleById(titleId) {
  const response = await get(`/api/title/${titleId}`);
  return response.data;
}

export function getTitleCoverURL(titleId) {
  return `${import.meta.env.VITE_YUME_ENDPOINT}/api/title/${titleId}/cover`;
}

export async function createSubtitle({
  name,
  author,
  pageStartNumber,
  pageEndNumber,
  bookId,
  libraryId,
}) {
  const response = await post("/api/title/subtitle", {
    name,
    author,
    page_start_number: pageStartNumber,
    page_end_number: pageEndNumber,
    book_id: bookId,
    library_id: libraryId,
  });

  return response.data;
}
