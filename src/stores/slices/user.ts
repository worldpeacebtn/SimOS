import type { StateCreator } from "zustand";

export interface UserSlice {
  typoraMd: string;
  setTyporaMd: (v: string) => void;
  faceTimeImages: { [date: string]: string };
  addFaceTimeImage: (v: string) => void;
  delFaceTimeImage: (k: string) => void;

  // ⭐ Add current user fields ⭐
  currentUser: { name: string; avatar: string } | null;
  setCurrentUser: (user: { name: string; avatar: string }) => void;
  clearCurrentUser: () => void;
}

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
  typoraMd: `# Hi 👋\nThis is a simple clone of [Typora](https://typora.io/). Built on top of [Milkdown](https://milkdown.dev/), an open-source WYSIWYG markdown editor.`,
  setTyporaMd: (v) => set(() => ({ typoraMd: v })),
  faceTimeImages: {},
  addFaceTimeImage: (v) =>
    set((state) => {
      const images = state.faceTimeImages;
      images[+new Date()] = v;
      return { faceTimeImages: images };
    }),
  delFaceTimeImage: (k) =>
    set((state) => {
      const images = state.faceTimeImages;
      delete images[k];
      return { faceTimeImages: images };
    }),

  // ⭐ New user state ⭐
  currentUser: null,
  setCurrentUser: (user) => set(() => ({ currentUser: user })),
  clearCurrentUser: () => set(() => ({ currentUser: null }))
});
