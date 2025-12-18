export interface TemplateVariable {
  name: string;
  placeholder: string;
}

export interface EmailTemplate {
  subject: string;
  body: string;
}

export interface PersonalizedEmail {
  to: string;
  subject: string;
  body: string;
  recipientData: Record<string, string>;
}

/**
 * Extracts all template variables from a string
 * Variables are in the format {{variableName}} - supports any characters including spaces
 */
export function extractVariables(text: string): TemplateVariable[] {
  const regex = /\{\{([^{}]+)\}\}/g;
  const variables: TemplateVariable[] = [];
  const seen = new Set<string>();
  
  let match;
  while ((match = regex.exec(text)) !== null) {
    const name = match[1].trim();
    if (!seen.has(name)) {
      seen.add(name);
      variables.push({
        name,
        placeholder: `{{${name}}}`,
      });
    }
  }
  
  return variables;
}

/**
 * Extracts variables from both subject and body of a template
 */
export function extractTemplateVariables(template: EmailTemplate): TemplateVariable[] {
  const subjectVars = extractVariables(template.subject);
  const bodyVars = extractVariables(template.body);
  
  // Combine and deduplicate
  const allVars = [...subjectVars, ...bodyVars];
  const seen = new Set<string>();
  
  return allVars.filter((v) => {
    if (seen.has(v.name)) return false;
    seen.add(v.name);
    return true;
  });
}

/**
 * Replaces template variables with actual values
 * Supports variable names with spaces and special characters
 */
export function substituteVariables(
  text: string,
  values: Record<string, string>
): string {
  return text.replace(/\{\{([^{}]+)\}\}/g, (match, varName) => {
    const trimmedName = varName.trim();
    return values[trimmedName] !== undefined ? values[trimmedName] : match;
  });
}

/**
 * Generates a personalized email for a recipient
 */
export function personalizeEmail(
  template: EmailTemplate,
  recipientData: Record<string, string>,
  emailField: string
): PersonalizedEmail {
  const to = recipientData[emailField] || "";
  const subject = substituteVariables(template.subject, recipientData);
  const body = substituteVariables(template.body, recipientData);
  
  return {
    to,
    subject,
    body,
    recipientData,
  };
}

/**
 * Generates personalized emails for all recipients
 */
export function personalizeEmails(
  template: EmailTemplate,
  recipients: Record<string, string>[],
  emailField: string
): PersonalizedEmail[] {
  return recipients.map((recipient) =>
    personalizeEmail(template, recipient, emailField)
  );
}

/**
 * Validates that all template variables have matching CSV columns
 */
export function validateTemplateVariables(
  template: EmailTemplate,
  availableColumns: string[]
): { isValid: boolean; missingVariables: string[] } {
  const variables = extractTemplateVariables(template);
  const missingVariables = variables
    .filter((v) => !availableColumns.includes(v.name))
    .map((v) => v.name);
  
  return {
    isValid: missingVariables.length === 0,
    missingVariables,
  };
}

/**
 * Creates a sample/preview of the personalized email
 */
export function createPreview(
  template: EmailTemplate,
  sampleData: Record<string, string>,
  emailField: string
): PersonalizedEmail {
  return personalizeEmail(template, sampleData, emailField);
}

/**
 * Converts plain text to HTML for Gmail
 * - Escapes HTML entities
 * - Converts line breaks to <br> tags
 */
export function textToHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

/**
 * Wraps content in Gmail's default HTML structure
 * Uses the gmail_default class and styling to match emails sent from Gmail's web interface
 * - Font: arial, sans-serif (Gmail's "Sans Serif" default)
 * - Size: small (~13-14px, Gmail's "Normal" size)
 * - Color: #222222 (Gmail's default off-black)
 */
export function wrapInHtmlTemplate(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0;">
  <div class="gmail_default" style="font-family: arial, sans-serif; font-size: small; color: #222222;">
    ${content}
  </div>
</body>
</html>`.trim();
}

/**
 * Saves template to localStorage
 */
export function saveTemplate(name: string, template: EmailTemplate): void {
  if (typeof window === "undefined") return;
  
  const templates = getStoredTemplates();
  templates[name] = template;
  localStorage.setItem("mailmerge_templates", JSON.stringify(templates));
}

/**
 * Gets all stored templates from localStorage
 */
export function getStoredTemplates(): Record<string, EmailTemplate> {
  if (typeof window === "undefined") return {};
  
  try {
    const stored = localStorage.getItem("mailmerge_templates");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Deletes a template from localStorage
 */
export function deleteTemplate(name: string): void {
  if (typeof window === "undefined") return;
  
  const templates = getStoredTemplates();
  delete templates[name];
  localStorage.setItem("mailmerge_templates", JSON.stringify(templates));
}

