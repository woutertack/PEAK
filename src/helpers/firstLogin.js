
import {create} from 'zustand';


const useStore = create((set) => ({
  firstLogin: false,
  setFirstLogin: (firstLogin) => set(() => ({ firstLogin }))
}));

export default useStore;
