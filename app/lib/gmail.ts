import { google } from "googleapis";

export interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  scheduledTime?: Date; // For Gmail's schedule send feature
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  recipient: string;
}

/**
 * Creates a Gmail API client with the user's access token
 */
export function createGmailClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  
  return google.gmail({ version: "v1", auth: oauth2Client });
}

/**
 * Creates an RFC 2822 formatted email message
 */
function createRawEmail(to: string, subject: string, body: string, from?: string): string {
  const emailLines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "",
    body,
  ];
  
  if (from) {
    emailLines.unshift(`From: ${from}`);
  }
  
  const email = emailLines.join("\r\n");
  
  // Base64url encode the email
  return Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Sends a single email via Gmail API
 */
export async function sendEmail(
  accessToken: string,
  options: EmailOptions
): Promise<SendResult> {
  try {
    const gmail = createGmailClient(accessToken);
    const rawEmail = createRawEmail(options.to, options.subject, options.body);
    
    // If scheduling, we need to create a draft and then schedule it
    // Gmail's schedule send is done via the drafts.create + messages.send with delay
    // However, Gmail API doesn't directly support schedule send like the UI does
    // We'll use a workaround by sending immediately for now, or the user can use
    // the native Gmail scheduling by creating drafts
    
    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: rawEmail,
      },
    });
    
    return {
      success: true,
      messageId: response.data.id || undefined,
      recipient: options.to,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: errorMessage,
      recipient: options.to,
    };
  }
}

/**
 * Creates a draft email (can be used for scheduling via Gmail UI)
 */
export async function createDraft(
  accessToken: string,
  options: EmailOptions
): Promise<SendResult> {
  try {
    const gmail = createGmailClient(accessToken);
    const rawEmail = createRawEmail(options.to, options.subject, options.body);
    
    const response = await gmail.users.drafts.create({
      userId: "me",
      requestBody: {
        message: {
          raw: rawEmail,
        },
      },
    });
    
    return {
      success: true,
      messageId: response.data.id || undefined,
      recipient: options.to,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: errorMessage,
      recipient: options.to,
    };
  }
}

/**
 * Sends multiple emails in bulk with a delay between each to avoid rate limiting
 */
export async function sendBulkEmails(
  accessToken: string,
  emails: EmailOptions[],
  delayMs: number = 1000,
  onProgress?: (completed: number, total: number, result: SendResult) => void
): Promise<SendResult[]> {
  const results: SendResult[] = [];
  
  for (let i = 0; i < emails.length; i++) {
    const result = await sendEmail(accessToken, emails[i]);
    results.push(result);
    
    if (onProgress) {
      onProgress(i + 1, emails.length, result);
    }
    
    // Add delay between emails to avoid rate limiting (except for the last email)
    if (i < emails.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

/**
 * Schedules an email to be sent at a specific time
 * Note: Gmail API doesn't have direct schedule send support like the UI
 * This creates a draft with metadata that could be processed by a scheduler
 * For true Gmail-native scheduling, users would need to use the Gmail web interface
 */
export async function scheduleEmail(
  accessToken: string,
  options: EmailOptions & { scheduledTime: Date }
): Promise<SendResult> {
  // Calculate delay until scheduled time
  const now = new Date();
  const delay = options.scheduledTime.getTime() - now.getTime();
  
  if (delay <= 0) {
    // If scheduled time has passed, send immediately
    return sendEmail(accessToken, options);
  }
  
  // For now, we'll create a draft that the user can manually schedule
  // or we can implement a background job system later
  return createDraft(accessToken, options);
}

