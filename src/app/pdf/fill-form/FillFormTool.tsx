"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import {
  readFormFields,
  fillForm,
  type FormField,
  type FormFillResult,
} from "@/lib/pdf-form";
import { downloadBlob } from "@/lib/download";

/** Field names are often paths like "topmostSubform[0].Page1[0].f1_01[0]". */
function prettyName(name: string): string {
  const leaf = name.split(/[.\\/]/).pop() ?? name;
  return leaf
    .replace(/\[\d+\]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim() || name;
}

export default function FillFormTool() {
  const [file, setFile] = useState<File | null>(null);
  const [fields, setFields] = useState<FormField[] | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [flatten, setFlatten] = useState(true);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<FormFillResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const chosen = files[0];
    setResult(null);
    setError(null);
    setFields(null);
    setFile(chosen);

    try {
      const read = await readFormFields(chosen);
      setFields(read.fields);
      setValues(Object.fromEntries(read.fields.map((f) => [f.name, f.value])));
    } catch (err) {
      // Clear the file so the error renders outside the {file && …} branch.
      setFile(null);
      setError(err instanceof Error ? err.message : "This PDF could not be read.");
    }
  }, []);

  const handleFill = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await fillForm(file, values, flatten, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while filling the form.");
    } finally {
      setProcessing(false);
    }
  }, [file, values, flatten]);

  const reset = () => {
    setFile(null);
    setFields(null);
    setValues({});
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const set = (name: string, value: string) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const inputClass =
    "w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50";

  return (
    <>
      {!file && (
        <FileDropZone
          accept=".pdf"
          maxFileSizeMB={100}
          onFiles={handleFiles}
          label="Drop a fillable PDF here, or click to browse"
          sublabel="Up to 100MB"
        />
      )}

      {!file && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {file && fields && !result && (
        <div className="space-y-6">
          <div className="p-3 bg-surface-raised rounded-lg">
            <p className="text-sm font-medium text-ink truncate">{file.name}</p>
            <p className="text-xs text-ink-muted mt-0.5">
              {fields.length} field{fields.length === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={`field-${field.name}`}
                  className="block text-xs font-medium text-ink-secondary mb-1.5"
                >
                  {prettyName(field.name)}
                  {field.pages.length > 0 && (
                    <span className="text-ink-muted font-normal">
                      {" "}· page {field.pages.join(", ")}
                    </span>
                  )}
                  {field.readOnly && (
                    <span className="text-ink-muted font-normal"> · read-only</span>
                  )}
                </label>

                {field.type === "text" && !field.multiline && (
                  <input
                    id={`field-${field.name}`}
                    type="text"
                    value={values[field.name] ?? ""}
                    disabled={field.readOnly}
                    onChange={(e) => set(field.name, e.target.value)}
                    className={inputClass}
                  />
                )}

                {field.type === "text" && field.multiline && (
                  <textarea
                    id={`field-${field.name}`}
                    rows={3}
                    value={values[field.name] ?? ""}
                    disabled={field.readOnly}
                    onChange={(e) => set(field.name, e.target.value)}
                    className={`${inputClass} resize-y`}
                  />
                )}

                {field.type === "checkbox" && (
                  <label className="flex items-center gap-2 cursor-pointer py-1.5">
                    <input
                      id={`field-${field.name}`}
                      type="checkbox"
                      checked={values[field.name] === "on"}
                      disabled={field.readOnly}
                      onChange={(e) => set(field.name, e.target.checked ? "on" : "off")}
                      className="accent-accent"
                    />
                    <span className="text-sm text-ink-secondary">Ticked</span>
                  </label>
                )}

                {(field.type === "dropdown" || field.type === "list" || field.type === "radio") && (
                  <select
                    id={`field-${field.name}`}
                    value={values[field.name] ?? ""}
                    disabled={field.readOnly}
                    onChange={(e) => set(field.name, e.target.value)}
                    className={inputClass}
                  >
                    <option value="">— not set —</option>
                    {(field.options ?? []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={flatten}
                onChange={(e) => setFlatten(e.target.checked)}
                className="accent-accent"
              />
              <span className="text-xs text-ink-secondary">
                Flatten when saving — values become permanent page content
              </span>
            </label>
            {!flatten && (
              <p className="text-xs text-ink-muted pl-6">
                Left unflattened, the file stays an editable form — and a value you
                replaced can still be recovered from inside it. Flatten before sending
                a form that arrived with someone else&apos;s details in it.
              </p>
            )}
          </div>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleFill}
              disabled={processing}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-150"
            >
              {processing ? "Saving…" : "Save filled PDF"}
            </button>
            <button
              onClick={reset}
              disabled={processing}
              className="py-3 px-4 border border-border text-ink-secondary hover:bg-surface-raised disabled:opacity-40 rounded-lg transition-colors duration-150"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-5">
          <ResultBanner
            title="Form filled"
            detail={`${result.fieldsWritten} field${
              result.fieldsWritten === 1 ? "" : "s"
            } written${result.flattened ? " and flattened" : ""}`}
          />

          {result.notice && <NoticeMessage>{result.notice}</NoticeMessage>}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 min-w-[10rem] py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors duration-150"
            >
              Download PDF
            </button>
            <button
              onClick={reset}
              className="py-3 px-4 border border-border text-ink-secondary hover:bg-surface-raised rounded-lg transition-colors duration-150"
            >
              Fill another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
