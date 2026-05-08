import { NextRequest, NextResponse } from "next/server"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { kycService } from "@/lib/kyc-service"
import { createServerSupabaseClient } from "@/lib/supabase-server-helpers"

// GET - Get user's KYC submissions
export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  // Use server-side client with user's session
  const { client } = createServerSupabaseClient(request)
  const submissions = await kycService.getByUserId(user.id, client)
  return NextResponse.json({ submissions })
})

// POST - Create new KYC submission
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  // Use server-side client with user's session for storage uploads
  const { client } = createServerSupabaseClient(request)

  const formData = await request.formData()
  const type = formData.get("type") as string
  const file = formData.get("file") as File

  if (!type || !file) {
    return createErrorResponse("Type and file are required", 400)
  }

  if (type === "identity") {
    const country_code = formData.get("country_code") as string
    const id_type = formData.get("id_type") as string
    const full_name = (formData.get("full_name") as string) || ""
    const date_of_birth = (formData.get("date_of_birth") as string) || ""

    if (!country_code || !id_type || !full_name.trim() || !date_of_birth.trim()) {
      return createErrorResponse(
        "Country code, ID type, full name, and date of birth are required for identity verification",
        400,
      )
    }

    const submission = await kycService.createIdentitySubmission(
      user.id,
      {
        full_name: full_name.trim(),
        date_of_birth: date_of_birth.trim(),
        country_code,
        id_type,
        id_document_file: file,
      },
      client,
    )

    return NextResponse.json({ submission })
  } else if (type === "address") {
    const document_type = formData.get("document_type") as string
    const country_code = (formData.get("country_code") as string) || ""
    const address = (formData.get("address") as string) || ""

    const validDocumentTypes = ["utility_bill", "bank_statement", "lease_agreement"]
    if (!document_type || !validDocumentTypes.includes(document_type)) {
      return createErrorResponse("Valid document type is required for address verification", 400)
    }
    if (!country_code.trim() || !address.trim()) {
      return createErrorResponse("Country and address text are required for address verification", 400)
    }

    const submission = await kycService.createAddressSubmission(
      user.id,
      {
        country_code: country_code.trim(),
        address: address.trim(),
        document_type: document_type as "utility_bill" | "bank_statement" | "lease_agreement",
        address_document_file: file,
      },
      client,
    )

    return NextResponse.json({ submission })
  } else {
    return createErrorResponse("Invalid submission type", 400)
  }
})
