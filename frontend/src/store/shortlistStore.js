import { create } from "zustand";
import { addToShortlist, getShortlist, removeFromShortlist } from "../api/shortlist";

const useShortlistStore = create((set, get) => ({
  shortlistedIds: new Set(),
  entries: [],
  loading: false,

  fetchShortlist: async () => {
    set({ loading: true });
    try {
      const { data } = await getShortlist();
      const ids = new Set(data.map((e) => e.venue.id));
      set({ entries: data, shortlistedIds: ids });
    } catch {
      // unauthenticated — silently clear
      set({ entries: [], shortlistedIds: new Set() });
    } finally {
      set({ loading: false });
    }
  },

  toggle: async (venue) => {
    const { shortlistedIds } = get();
    if (shortlistedIds.has(venue.id)) {
      await removeFromShortlist(venue.id);
      set((s) => {
        const next = new Set(s.shortlistedIds);
        next.delete(venue.id);
        return {
          shortlistedIds: next,
          entries: s.entries.filter((e) => e.venue.id !== venue.id),
        };
      });
    } else {
      const { data } = await addToShortlist(venue.id);
      set((s) => {
        const next = new Set(s.shortlistedIds);
        next.add(venue.id);
        return {
          shortlistedIds: next,
          entries: [data, ...s.entries],
        };
      });
    }
  },

  clear: () => set({ shortlistedIds: new Set(), entries: [] }),
}));

export default useShortlistStore;
