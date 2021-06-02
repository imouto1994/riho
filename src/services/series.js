import { get } from "../utils/request";

export async function getSeries(queryParams = {}) {
  const {
    libraryId,
    page = 0,
    search,
    size = 24,
    sort = "createdDate,desc",
  } = queryParams;

  const response = await get("/api/v1/series", {
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

export async function getSeriesById(seriesId) {
  const response = await get(`/api/v1/series/${seriesId}`);
  return response.data;
}

export function getSeriesThumbnailUrl(seriesId) {
  return `${
    import.meta.env.VITE_KOMGA_ENDPOINT
  }/api/v1/series/${seriesId}/thumbnail`;
}
