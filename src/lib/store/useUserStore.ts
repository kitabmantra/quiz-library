import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type UserStore = {
    user : User | undefined;
    setUser : (user : User | undefined) => void;
    clearUser : () => void;
}



export const useUserStore = create<UserStore>()(
    persist((set) => ({
        user : undefined,
        setUser : (user : User | undefined) => set({user}),
        clearUser : () => set({user : undefined})
    }),{
        name : "user-store",
        storage : createJSONStorage(() => localStorage)
    })
)