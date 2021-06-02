import axios from "redaxios";
import queryString from "query-string";

const authorizationHeader = `Basic ${btoa(
  `${import.meta.env.VITE_KOMGA_USERNAME}:${
    import.meta.env.VITE_KOMGA_PASSWORD
  }`,
)}`;

export async function get(url, options = {}) {
  const { headers = {}, params = {} } = options;
  for (const key of Object.keys(params)) {
    if (params[key] == null) {
      delete params[key];
    }
  }
  const search = queryString.stringify(params);

  return axios.get(
    `${import.meta.env.VITE_KOMGA_ENDPOINT}${url}${
      search.length > 0 ? `?${search}` : ""
    }`,
    {
      headers: {
        ...headers,
        Authorization: authorizationHeader,
      },
      withCredentials: true,
    },
  );
}
