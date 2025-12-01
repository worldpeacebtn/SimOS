import type { StateCreator } from "zustand";
export interface UserSlice {
  currentUser: { name: string; avatar: string } | null;
  setCurrentUser: (user: { name: string; avatar: string }) => void;

  typoraMd: string;
  setTyporaMd: (v: string) => void;
  faceTimeImages: { [date: string]: string };
  addFaceTimeImage: (v: string) => void;
  delFaceTimeImage: (k: string) => void;
}

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
  currentUser: { name: "User", avatar: "/default-avatar.png" }, // default
  setCurrentUser: (user) => set({ currentUser: user }),

  typoraMd: `# Hi 👋 ...`,
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
    })
});
