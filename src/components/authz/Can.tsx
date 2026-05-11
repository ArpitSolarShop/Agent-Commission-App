'use client';

import { createContext, useContext } from 'react';
import { createContextualCan } from '@casl/react';
import { AppAbility } from '@/lib/authz/ability';
import { PureAbility } from '@casl/ability';

export const AbilityContext = createContext<AppAbility>(new PureAbility([]) as any);
export const Can = createContextualCan(AbilityContext.Consumer);

export function useAbility() {
  return useContext(AbilityContext);
}

// Optional wrapper for providing the ability to the client app
export function AbilityProvider({ ability, children }: { ability: AppAbility, children: React.ReactNode }) {
  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}
