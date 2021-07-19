import { get } from "../utils/request";

export async function getLibraries() {
  const response = await get("/api/library");
  return response.data;
}
