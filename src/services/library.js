import { get } from "../utils/request";

export async function getLibraries() {
  const response = await get("/api/v1/libraries");
  return response.data;
}

export async function getLibraryById(libraryId) {
  const response = await get(`/api/v1/libraries/${libraryId}`);
  return response.data;
}
