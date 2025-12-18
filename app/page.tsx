"use client";

import { useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import AuthButton from "./components/AuthButton";
import CsvUploader from "./components/CsvUploader";
import TemplateEditor from "./components/TemplateEditor";
import RecipientTable from "./components/RecipientTable";
import EmailPreview from "./components/EmailPreview";
import SendControls, { SendMode } from "./components/SendControls";
import ProgressTracker from "./components/ProgressTracker";
import { ParsedCSV } from "./lib/csv-parser";
import { EmailTemplate, personalizeEmails, PersonalizedEmail, textToHtml, wrapInHtmlTemplate } from "./lib/template";
import { SendResult } from "./lib/gmail";

type Step = "upload" | "compose" | "preview" | "send";

export default function Home() {
  const { data: session, status } = useSession();

  // State
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [csvData, setCsvData] = useState<ParsedCSV | null>(null);
  const [emailField, setEmailField] = useState<string>("");
  const [template, setTemplate] = useState<EmailTemplate>({ subject: "", body: "" });
  const [selectedRecipientIndex, setSelectedRecipientIndex] = useState(0);

  // Sending state
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState({ completed: 0, total: 0 });
  const [sendResults, setSendResults] = useState<SendResult[]>([]);
  const [showProgress, setShowProgress] = useState(false);

  // Handlers
  const handleDataParsed = useCallback((data: ParsedCSV, email: string) => {
    setCsvData(data);
    setEmailField(email);
    setCurrentStep("compose");
  }, []);

  const handleTemplateChange = useCallback((newTemplate: EmailTemplate) => {
    setTemplate(newTemplate);
  }, []);

  // Generate personalized emails
  const personalizedEmails = useMemo((): PersonalizedEmail[] => {
    if (!csvData || !template.subject || !emailField) return [];
    return personalizeEmails(template, csvData.rows, emailField);
  }, [csvData, template, emailField]);

  // Current preview email
  const previewEmail = useMemo(() => {
    return personalizedEmails[selectedRecipientIndex] || null;
  }, [personalizedEmails, selectedRecipientIndex]);

  // Check if ready to send
  const isReadyToSend = useMemo(() => {
    return (
      !!session?.accessToken &&
      personalizedEmails.length > 0 &&
      !!template.subject &&
      !!template.body
    );
  }, [session, personalizedEmails, template]);

  // Handle send
  const handleSend = async (mode: SendMode, scheduledTime?: Date) => {
    if (!isReadyToSend) return;

    setIsSending(true);
    setShowProgress(true);
    setSendProgress({ completed: 0, total: personalizedEmails.length });
    setSendResults([]);

    try {
      const emailsToSend = personalizedEmails.map((email) => ({
        to: email.to,
        subject: email.subject,
        body: wrapInHtmlTemplate(textToHtml(email.body)),
      }));

      const response = await fetch("/api/gmail/send-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: emailsToSend,
          mode,
          scheduledTime: scheduledTime?.toISOString(),
        }),
      });

      const data = await response.json();

      if (data.results) {
        setSendResults(data.results);
        setSendProgress({
          completed: data.results.length,
          total: personalizedEmails.length,
        });
      }
    } catch (error) {
      console.error("Error sending emails:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleProgressClose = () => {
    setShowProgress(false);
    setSendResults([]);
    setSendProgress({ completed: 0, total: 0 });
  };

  // Reset and start over
  const handleReset = () => {
    setCsvData(null);
    setEmailField("");
    setTemplate({ subject: "", body: "" });
    setSelectedRecipientIndex(0);
    setCurrentStep("upload");
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-emerald-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-emerald-950/20">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Mail Merge
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Personalized bulk emails
                </p>
              </div>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!session ? (
          // Not authenticated
          <div className="max-w-lg mx-auto text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
              Send Personalized Bulk Emails
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8">
              Connect your Gmail account to send personalized emails to your recipients.
              Upload a CSV, compose your template, and send or schedule your campaign.
            </p>
            <AuthButton />
            <div className="mt-12 grid grid-cols-3 gap-6 text-left">
              <div className="p-4 rounded-xl bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                  <span className="text-xl">📊</span>
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">
                  CSV Upload
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Import recipients from any CSV file
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                  <span className="text-xl">✨</span>
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">
                  Personalization
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Use {"{{variables}}"} for dynamic content
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
                  <span className="text-xl">⏰</span>
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">
                  Schedule Send
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Send now or schedule for later
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Authenticated - Show app
          <div className="space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                {csvData && (
                  <button
                    onClick={handleReset}
                    className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Start Over
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`px-3 py-1 rounded-full ${
                    currentStep === "upload"
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium"
                      : csvData
                      ? "bg-emerald-500 text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                  }`}
                >
                  1. Upload
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">→</span>
                <span
                  className={`px-3 py-1 rounded-full ${
                    currentStep === "compose"
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium"
                      : template.subject && template.body
                      ? "bg-emerald-500 text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                  }`}
                >
                  2. Compose
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">→</span>
                <span
                  className={`px-3 py-1 rounded-full ${
                    currentStep === "preview" || currentStep === "send"
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                  }`}
                >
                  3. Send
                </span>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* CSV Upload Section */}
                <section className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-center font-bold">
                      1
                    </span>
                    Upload Recipients
                  </h2>
                  {!csvData ? (
                    <CsvUploader onDataParsed={handleDataParsed} />
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            {csvData.rows.length} recipients loaded
                          </span>
                        </div>
                        <button
                          onClick={handleReset}
                          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          Change
                        </button>
                      </div>
                      <RecipientTable
                        data={csvData}
                        emailField={emailField}
                        selectedIndex={selectedRecipientIndex}
                        onSelectRecipient={setSelectedRecipientIndex}
                      />
                    </div>
                  )}
                </section>

                {/* Template Editor Section */}
                {csvData && (
                  <section className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-center font-bold">
                        2
                      </span>
                      Compose Email
                    </h2>
                    <TemplateEditor
                      availableVariables={csvData.headers}
                      onTemplateChange={handleTemplateChange}
                      initialTemplate={template}
                    />
                  </section>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Preview Section */}
                {csvData && (
                  <section className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Email Preview
                    </h2>
                    <EmailPreview
                      email={previewEmail}
                      recipientIndex={selectedRecipientIndex}
                      totalRecipients={csvData.rows.length}
                    />
                  </section>
                )}

                {/* Send Controls */}
                {csvData && template.subject && template.body && (
                  <section className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-center font-bold">
                        3
                      </span>
                      Send Emails
                    </h2>
                    <SendControls
                      recipientCount={personalizedEmails.length}
                      isReady={isReadyToSend}
                      isSending={isSending}
                      onSend={handleSend}
                    />
                  </section>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Progress Tracker Modal */}
      <ProgressTracker
        isActive={isSending}
        total={sendProgress.total}
        completed={sendProgress.completed}
        results={sendResults}
        onClose={handleProgressClose}
      />

      {/* Footer */}
      <footer className="mt-20 py-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-zinc-500">
            Mail Merge Tool • Sends via Gmail API • Free Gmail accounts have ~100 emails/day limit
          </p>
        </div>
      </footer>
    </div>
  );
}
