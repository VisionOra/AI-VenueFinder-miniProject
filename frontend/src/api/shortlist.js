import client from "./client";

export const getShortlist = () => client.get("/shortlist/");

export const addToShortlist = (venueId) =>
  client.post(`/venues/${venueId}/shortlist/`);

export const removeFromShortlist = (venueId) =>
  client.delete(`/venues/${venueId}/shortlist/remove/`);
