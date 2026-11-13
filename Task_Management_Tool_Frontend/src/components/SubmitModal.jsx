import { useEffect, useRef, useState } from "react";
import {
  X,
  Link2,
  Upload,
  FileText,
  Trash2,
  Send,
  AlertCircle,
  Plus,
  ExternalLink,
  Download,
} from "lucide-react";

const MAX_MB = 5;

export default function SubmitModal({ open, task, onClose, onSubmit }) {
  const [links, setLinks] = useState([""]);
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const isViewMode = !!task?.submission;

  /* Prefill from existing submission (view / re-submit) */
  useEffect(() => {
    if (!open) return;

    if (task?.submission) {
      const sub = task.submission;
      setLinks(
        sub.links && sub.links.length > 0 ? [...sub.links] : [""]
      );
      setFiles(
        (sub.files || []).map((f) => ({
          name: f.name,
          dataUrl: f.dataUrl,
          size: f.dataUrl?.length || 0,
        }))
      );
      setNotes(sub.notes || "");
    } else {
      setLinks([""]);
      setFiles([]);
      setNotes("");
    }

    setError("");
    setDragging(false);
  }, [open, task]);

  if (!open || !task) return null;

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition";

  /* ---------- Links ---------- */
  const updateLink = (i, value) => {
    setLinks((prev) => prev.map((l, idx) => (idx === i ? value : l)));
  };
  const addLink = () => setLinks((prev) => [...prev, ""]);
  const removeLink = (i) =>
    setLinks((prev) =>
      prev.length === 1 ? [""] : prev.filter((_, idx) => idx !== i)
    );

  /* ---------- Files ---------- */
  const readFile = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf")
      return setError("Only PDF files are allowed.");
    if (f.size > MAX_MB * 1024 * 1024)
      return setError(`Each file must be under ${MAX_MB}MB.`);
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      setFiles((prev) => [
        ...prev,
        { name: f.name, size: f.size, dataUrl: reader.result },
      ]);
    };
    reader.readAsDataURL(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    Array.from(e.dataTransfer.files || []).forEach(readFile);
  };

  const handleFilePick = (e) => {
    Array.from(e.target.files || []).forEach(readFile);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (i) =>
    setFiles((prev) => prev.filter((_, idx) => idx !== i));

  /* ---------- Submit ---------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanLinks = links.map((l) => l.trim()).filter(Boolean);
    const invalid = cleanLinks.find((l) => !/^https?:\/\//i.test(l));
    if (invalid) {
      return setError(
        `Invalid link: "${invalid}". Must start with http:// or https://`
      );
    }
    if (cleanLinks.length === 0 && files.length === 0) {
      return setError("Please provide at least one link or PDF.");
    }

    onSubmit({
      links: cleanLinks,
      files: files.map(({ name, dataUrl }) => ({ name, dataUrl })),
      notes: notes.trim() || null,
      submittedAt: new Date().toISOString(),
    });
    onClose();
  };

  const prettySize = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        {/* ---------- HEADER ---------- */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-start justify-between gap-3 rounded-t-2xl z-10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Send
                size={18}
                className="text-emerald-600 dark:text-emerald-400"
              />
              <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wide">
                {isViewMode ? "View Submission" : "Submit Task"}
              </span>
            </div>
            <h3 className="text-lg font-bold dark:text-white truncate">
              {task.title}
            </h3>
            {isViewMode && task.submission?.submittedAt && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Submitted{" "}
                {new Date(task.submission.submittedAt).toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isViewMode
              ? "Review the submitted work below. You can update or replace it any time."
              : "Attach your completed work — add multiple links and/or multiple PDFs."}
          </p>

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ---------- LINKS ---------- */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold dark:text-slate-200">
                Work Links ({links.filter((l) => l.trim()).length})
              </label>
              <button
                type="button"
                onClick={addLink}
                className="flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                <Plus size={12} /> Add link
              </button>
            </div>

            <div className="space-y-2">
              {links.map((l, i) => (
                <div key={i} className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="url"
                      value={l}
                      onChange={(e) => updateLink(i, e.target.value)}
                      placeholder={`https://... (link ${i + 1})`}
                      className={inputClass + " pl-9"}
                    />
                  </div>

                  {/* Open link in new tab (only in view mode when it's a valid URL) */}
                  {isViewMode && l.trim() && /^https?:\/\//i.test(l) && (
                    <a
                      href={l.trim()}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition flex-shrink-0"
                      title="Open link"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => removeLink(i)}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition flex-shrink-0"
                    aria-label="Remove link"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ---------- DIVIDER ---------- */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">
              or
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* ---------- FILES ---------- */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold dark:text-slate-200">
                Upload PDFs ({files.length})
              </label>
            </div>

            {files.length > 0 && (
              <div className="space-y-2 mb-3">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {f.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {prettySize(f.size)}
                      </p>
                    </div>

                    {/* Download file */}
                    {f.dataUrl && (
                      <a
                        href={f.dataUrl}
                        download={f.name}
                        className="p-2 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition"
                        title="Download"
                      >
                        <Download size={16} />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                      aria-label="Remove file"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition ${
                dragging
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                  : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-emerald-400 dark:hover:border-emerald-600"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <Upload
                  size={18}
                  className="text-slate-500 dark:text-slate-300"
                />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                PDF only · Max {MAX_MB}MB each · Multiple allowed
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                multiple
                onChange={handleFilePick}
                className="hidden"
              />
            </label>
          </div>

          {/* ---------- NOTES ---------- */}
          <div>
            <label className="block text-sm font-semibold mb-1.5 dark:text-slate-200">
              Notes{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Anything the reviewer should know..."
              className={inputClass + " resize-none"}
            />
          </div>

          {/* ---------- FOOTER ---------- */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {isViewMode ? "Close" : "Cancel"}
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition active:scale-95"
            >
              <Send size={16} />
              {isViewMode ? "Update Submission" : "Submit Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}