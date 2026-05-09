"use client"

import { useParams } from "next/navigation"
import { ExpertProfileView } from "@/components/hub/expert-profile-view"

export default function ExpertsProfilePage() {
  const slugOrId = String(useParams()?.slug || "").trim()
  return <ExpertProfileView key={slugOrId || "_"} slugOrId={slugOrId} />
}
