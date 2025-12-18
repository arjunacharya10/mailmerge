"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { EmailTemplate, extractTemplateVariables, getStoredTemplates, saveTemplate, deleteTemplate } from "../lib/template";

interface TemplateEditorProps {
  availableVariables: string[];
  onTemplateChange: (template: EmailTemplate) => void;
  initialTemplate?: EmailTemplate;
}

type FocusedField = "subject" | "body" | null;

export default function TemplateEditor({
  availableVariables,
  onTemplateChange,
  initialTemplate,
}: TemplateEditorProps) {
  const [subject, setSubject] = useState(initialTemplate?.subject || "");
  const [body, setBody] = useState(initialTemplate?.body || "");
  const [savedTemplates, setSavedTemplates] = useState<Record<string, EmailTemplate>>(() => {
    // Lazy initialization - runs only on first render
    if (typeof window === "undefined") return {};
    return getStoredTemplates();
  });
  const [templateName, setTemplateName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  // Track which field was last focused and cursor position
  const [lastFocusedField, setLastFocusedField] = useState<FocusedField>("body");
  const [cursorPosition, setCursorPosition] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  
  // Refs for input elements
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // Notify parent of changes
  useEffect(() => {
    onTemplateChange({ subject, body });
  }, [subject, body, onTemplateChange]);

  const usedVariables = extractTemplateVariables({ subject, body });
  const unusedVariables = availableVariables.filter(
    (v) => !usedVariables.some((uv) => uv.name === v)
  );

  // Track focus and cursor position
  const handleSubjectFocus = () => {
    setLastFocusedField("subject");
  };

  const handleBodyFocus = () => {
    setLastFocusedField("body");
  };

  const handleSubjectSelect = () => {
    if (subjectRef.current) {
      setCursorPosition({
        start: subjectRef.current.selectionStart || 0,
        end: subjectRef.current.selectionEnd || 0,
      });
    }
  };

  const handleBodySelect = () => {
    if (bodyRef.current) {
      setCursorPosition({
        start: bodyRef.current.selectionStart || 0,
        end: bodyRef.current.selectionEnd || 0,
      });
    }
  };

  // Insert variable at cursor position
  const insertVariableAtCursor = useCallback((variable: string) => {
    const placeholder = `{{${variable}}}`;
    
    if (lastFocusedField === "subject") {
      const before = subject.slice(0, cursorPosition.start);
      const after = subject.slice(cursorPosition.end);
      const newSubject = before + placeholder + after;
      setSubject(newSubject);
      
      // Restore focus and set cursor after the inserted variable
      setTimeout(() => {
        if (subjectRef.current) {
          subjectRef.current.focus();
          const newPosition = cursorPosition.start + placeholder.length;
          subjectRef.current.setSelectionRange(newPosition, newPosition);
          setCursorPosition({ start: newPosition, end: newPosition });
        }
      }, 0);
    } else {
      // Default to body
      const before = body.slice(0, cursorPosition.start);
      const after = body.slice(cursorPosition.end);
      const newBody = before + placeholder + after;
      setBody(newBody);
      
      // Restore focus and set cursor after the inserted variable
      setTimeout(() => {
        if (bodyRef.current) {
          bodyRef.current.focus();
          const newPosition = cursorPosition.start + placeholder.length;
          bodyRef.current.setSelectionRange(newPosition, newPosition);
          setCursorPosition({ start: newPosition, end: newPosition });
        }
      }, 0);
    }
  }, [lastFocusedField, cursorPosition, subject, body]);

  // Legacy insert function for the quick-insert buttons
  const insertVariable = (variable: string, target: "subject" | "body") => {
    const placeholder = `{{${variable}}}`;
    if (target === "subject") {
      if (subjectRef.current) {
        const start = subjectRef.current.selectionStart || subject.length;
        const end = subjectRef.current.selectionEnd || subject.length;
        const before = subject.slice(0, start);
        const after = subject.slice(end);
        setSubject(before + placeholder + after);
        
        setTimeout(() => {
          if (subjectRef.current) {
            subjectRef.current.focus();
            const newPosition = start + placeholder.length;
            subjectRef.current.setSelectionRange(newPosition, newPosition);
          }
        }, 0);
      } else {
        setSubject((prev) => prev + placeholder);
      }
    } else {
      if (bodyRef.current) {
        const start = bodyRef.current.selectionStart || body.length;
        const end = bodyRef.current.selectionEnd || body.length;
        const before = body.slice(0, start);
        const after = body.slice(end);
        setBody(before + placeholder + after);
        
        setTimeout(() => {
          if (bodyRef.current) {
            bodyRef.current.focus();
            const newPosition = start + placeholder.length;
            bodyRef.current.setSelectionRange(newPosition, newPosition);
          }
        }, 0);
      } else {
        setBody((prev) => prev + placeholder);
      }
    }
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    saveTemplate(templateName, { subject, body });
    setSavedTemplates(getStoredTemplates());
    setShowSaveDialog(false);
    setTemplateName("");
  };

  const handleLoadTemplate = (name: string) => {
    const template = savedTemplates[name];
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
    }
  };

  const handleDeleteTemplate = (name: string) => {
    deleteTemplate(name);
    setSavedTemplates(getStoredTemplates());
  };

  return (
    <div className="space-y-4">
      {/* Saved Templates */}
      {Object.keys(savedTemplates).length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Saved Templates
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(savedTemplates).map((name) => (
              <div
                key={name}
                className="flex items-center gap-1 px-2 py-1 text-sm bg-zinc-100 dark:bg-zinc-800 rounded-lg"
              >
                <button
                  onClick={() => handleLoadTemplate(name)}
                  className="text-zinc-700 dark:text-zinc-300 hover:text-emerald-600"
                >
                  {name}
                </button>
                <button
                  onClick={() => handleDeleteTemplate(name)}
                  className="text-zinc-400 hover:text-red-500 ml-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subject Line */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Subject Line
          </label>
          <div className="flex gap-1">
            {availableVariables.slice(0, 3).map((v) => (
              <button
                key={v}
                onClick={() => insertVariable(v, "subject")}
                className="px-2 py-0.5 text-xs font-mono bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
              >
                +{v.length > 10 ? v.slice(0, 10) + "…" : v}
              </button>
            ))}
          </div>
        </div>
        <input
          ref={subjectRef}
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          onFocus={handleSubjectFocus}
          onSelect={handleSubjectSelect}
          onKeyUp={handleSubjectSelect}
          onClick={handleSubjectSelect}
          placeholder="e.g., Hello {{First Name}}, we have exciting news!"
          className="w-full px-4 py-2.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {/* Email Body */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Email Body
          </label>
          <div className="flex gap-1">
            {availableVariables.slice(0, 3).map((v) => (
              <button
                key={v}
                onClick={() => insertVariable(v, "body")}
                className="px-2 py-0.5 text-xs font-mono bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
              >
                +{v.length > 10 ? v.slice(0, 10) + "…" : v}
              </button>
            ))}
          </div>
        </div>
        <textarea
          ref={bodyRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onFocus={handleBodyFocus}
          onSelect={handleBodySelect}
          onKeyUp={handleBodySelect}
          onClick={handleBodySelect}
          placeholder="Write your email content here. Use {{First Name}} syntax to personalize..."
          rows={10}
          className="w-full px-4 py-3 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none font-mono"
        />
      </div>

      {/* Variable Status */}
      <div className="flex flex-wrap gap-4 text-xs">
        {usedVariables.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Used:</span>
            <div className="flex flex-wrap gap-1">
              {usedVariables.map((v) => (
                <span
                  key={v.name}
                  className={`px-2 py-0.5 font-mono rounded ${
                    availableVariables.includes(v.name)
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                  }`}
                >
                  {v.placeholder}
                </span>
              ))}
            </div>
          </div>
        )}
        {unusedVariables.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Available:</span>
            <div className="flex flex-wrap gap-1">
              {unusedVariables.map((v) => (
                <button
                  key={v}
                  onClick={() => insertVariableAtCursor(v)}
                  className="px-2 py-0.5 font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                  title={`Click to insert {{${v}}} at cursor`}
                >
                  {`{{${v}}}`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save Template Button */}
      <div className="flex gap-2">
        {showSaveDialog ? (
          <>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name..."
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              autoFocus
            />
            <button
              onClick={handleSaveTemplate}
              disabled={!templateName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-400 rounded-lg transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setShowSaveDialog(false)}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowSaveDialog(true)}
            disabled={!subject && !body}
            className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Save as Template
          </button>
        )}
      </div>
    </div>
  );
}
