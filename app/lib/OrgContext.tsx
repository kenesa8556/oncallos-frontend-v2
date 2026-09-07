"use client";

import { createContext, useContext } from "react";

interface OrgContextValue {
  orgId: string;
  orgName: string;
  orgPlan: string;
  userRole: string;
  orgList: { id: string; name: string }[];
}

export const OrgContext = createContext<OrgContextValue | null>(null);

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used within OrgContext.Provider");
  return ctx;
}