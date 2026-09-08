import { createContext, useContext } from 'react';

export const PersonalTabBarOwnerContext = createContext(false);

export function useHasPersonalTabBarOwner() {
  return useContext(PersonalTabBarOwnerContext);
}
