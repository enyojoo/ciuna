"use client"

import { useParams } from "next/navigation"
import { ExpertProfileView } from "@/components/hub/expert-profile-view"

export default function ExpertsProfilePage() {
  const id = String(useParams()?.id || "").trim()
  return <ExpertProfileView id={id} />
}
