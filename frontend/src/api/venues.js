import client from "./client";

export const listVenues = (params) => client.get("/venues/", { params });

export const getVenue = (id) => client.get(`/venues/${id}/`);

export const createVenue = (data) => client.post("/venues/", data);

export const startAISearch = (query) =>
  client.post("/venues/search/", { query });

export const pollAISearch = (jobId) =>
  client.get(`/venues/search/${jobId}/`);
