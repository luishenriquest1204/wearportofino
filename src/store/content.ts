import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_CONTENT, type HomeContent } from "../data/content";
import { sessionJSON } from "./storage";

type ContentState = { content: HomeContent; set: (c: HomeContent) => void; reset: () => void };

export const useContent = create<ContentState>()(
  persist(
    (set) => ({ content: DEFAULT_CONTENT, set: (content) => set({ content }), reset: () => set({ content: DEFAULT_CONTENT }) }),
    { name: "pf-content", storage: sessionJSON, version: 2 },
  ),
);
