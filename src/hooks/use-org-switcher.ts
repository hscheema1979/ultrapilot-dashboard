"use client"

import { useOrg } from "@/contexts/org-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function useOrgSwitcher() {
  const { currentOrg, setCurrentOrg, availableOrgs, orgRepoCounts } = useOrg()
  const router = useRouter()

  const switchOrg = (newOrg: string) => {
    if (!availableOrgs.includes(newOrg)) {
      toast.error(`Organization ${newOrg} is not available`)
      return
    }

    setCurrentOrg(newOrg)
    toast.success(`Switched to ${newOrg}`)

    // Refresh the current page to load data for the new org
    router.refresh()
  }

  const getOrgLabel = (org: string) => {
    const count = orgRepoCounts[org] ?? 0
    return count > 0 ? `${org} (${count})` : org
  }

  return {
    currentOrg,
    switchOrg,
    availableOrgs,
    orgRepoCounts,
    getOrgLabel,
  }
}
