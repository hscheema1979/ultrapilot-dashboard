"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface OrgContextValue {
  currentOrg: string
  setCurrentOrg: (org: string) => void
  availableOrgs: string[]
  orgRepoCounts: Record<string, number>
}

const OrgContext = createContext<OrgContextValue | undefined>(undefined)

const ORG_STORAGE_KEY = "ultrapilot-current-org"
const DEFAULT_ORGS = ["hscheema1979", "creative-adventures"]

interface OrgProviderProps {
  children: ReactNode
  availableOrgs?: string[]
}

export function OrgProvider({ children, availableOrgs = DEFAULT_ORGS }: OrgProviderProps) {
  const [currentOrg, setCurrentOrgState] = useState<string>(DEFAULT_ORGS[0])
  const [orgRepoCounts, setOrgRepoCounts] = useState<Record<string, number>>({})

  // Load current org from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(ORG_STORAGE_KEY)
    if (stored && availableOrgs.includes(stored)) {
      setCurrentOrgState(stored)
    }
  }, [availableOrgs])

  // Save to localStorage when org changes
  const setCurrentOrg = (org: string) => {
    if (availableOrgs.includes(org)) {
      setCurrentOrgState(org)
      localStorage.setItem(ORG_STORAGE_KEY, org)
    }
  }

  // Fetch repo counts for each org (mock for now, will be replaced with real API)
  useEffect(() => {
    const fetchRepoCounts = async () => {
      const counts: Record<string, number> = {}
      for (const org of availableOrgs) {
        try {
          const response = await fetch(`/api/github/repos?org=${org}`)
          if (response.ok) {
            const data = await response.json()
            counts[org] = data.repositories?.length || 0
          }
        } catch (error) {
          console.error(`Failed to fetch repo count for ${org}:`, error)
          counts[org] = 0
        }
      }
      setOrgRepoCounts(counts)
    }

    fetchRepoCounts()
  }, [availableOrgs])

  const value: OrgContextValue = {
    currentOrg,
    setCurrentOrg,
    availableOrgs,
    orgRepoCounts,
  }

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>
}

export function useOrg() {
  const context = useContext(OrgContext)
  if (context === undefined) {
    throw new Error("useOrg must be used within an OrgProvider")
  }
  return context
}
