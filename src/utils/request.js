import axios from "redaxios";
import queryString from "query-string";

export async function get(url, options = {}) {
  const { headers = {}, params = {} } = options;
  for (const key of Object.keys(params)) {
    if (params[key] == null) {
      delete params[key];
    }
  }
  const search = queryString.stringify(params);
  return axios.get(
    `${import.meta.env.VITE_YUME_ENDPOINT}${url}${
      search.length > 0 ? `?${search}` : ""
    }`,
    {
      headers,
      withCredentials: true,
    },
  );
}

export async function put(url, body = {}, options = {}) {
  const { headers = {}, params = {} } = options;
  for (const key of Object.keys(params)) {
    if (params[key] == null) {
      delete params[key];
    }
  }
  const search = queryString.stringify(params);
  return axios.put(
    `${import.meta.env.VITE_YUME_ENDPOINT}${url}${
      search.length > 0 ? `?${search}` : ""
    }`,
    body,
    {
      headers,
      withCredentials: true,
    },
  );
}

export async function post(url, body = {}, options = {}) {
  const { headers = {}, params = {} } = options;
  for (const key of Object.keys(params)) {
    if (params[key] == null) {
      delete params[key];
    }
  }
  const search = queryString.stringify(params);
  return axios.post(
    `${import.meta.env.VITE_YUME_ENDPOINT}${url}${
      search.length > 0 ? `?${search}` : ""
    }`,
    body,
    {
      headers,
      withCredentials: true,
    },
  );
}
