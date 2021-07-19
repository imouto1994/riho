import { get } from "../utils/request";

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
