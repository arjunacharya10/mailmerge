import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendEmail, createDraft, EmailOptions, SendResult } from "@/app/lib/gmail";

interface BulkSendRequest {
  emails: EmailOptions[];
  mode: "now" | "schedule";
  scheduledTime?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body: BulkSendRequest = await request.json();
    const { emails, mode, scheduledTime } = body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: "No emails provided" },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    if (emails.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 emails per batch" },
        { status: 400 }
      );
    }

    const results: SendResult[] = [];
    const delayMs = 500; // 500ms between emails to avoid rate limiting

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];

      let result: SendResult;

      if (mode === "schedule" && scheduledTime) {
        // For scheduled emails, create drafts
        // Note: Gmail API doesn't support direct schedule send like the UI
        // Users will need to send these drafts from Gmail
        result = await createDraft(session.accessToken, email);
      } else {
        // Send immediately
        result = await sendEmail(session.accessToken, email);
      }

      results.push(result);

      // Add delay between emails (except for the last one)
      if (i < emails.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      total: emails.length,
      sent: successCount,
      failed: failureCount,
      results,
    });
  } catch (error) {
    console.error("Error sending bulk emails:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

