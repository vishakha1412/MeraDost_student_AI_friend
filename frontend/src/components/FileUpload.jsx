import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { uploadDocument } from "../api";

export default function FileUpload({ sessionId, files, setFiles }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await uploadDocument({ sessionId, file });
      setFiles(res.files); 
      setToast(`✅ ${file.name} uploaded successfully`);
      setTimeout(() => setToast(""), 3000);  
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-2 relative">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.docx,.md"
        className="hidden"
        onChange={handleFile}
      />
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-dost-300/40 bg-dost-500/10 px-3 py-3 text-sm text-dost-100 hover:bg-dost-500/20 transition"
      >
        {uploading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Uploading...
          </>
        ) : (
          <>
            <UploadCloud size={16} /> Upload PDF / DOCX / TXT
          </>
        )}
      </motion.button>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center gap-2 truncate rounded-lg bg-white/5 px-2 py-1.5 text-xs text-slate-300"
              title={f}
            >
              <FileText size={13} className="shrink-0 text-dost-300" />
              <span className="truncate">{f}</span>
              <CheckCircle2 size={13} className="ml-auto shrink-0 text-green-400" />
            </li>
          ))}
        </ul>
      )}

     <AnimatePresence>
  {toast && (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50"
    >
      {toast}
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
}
