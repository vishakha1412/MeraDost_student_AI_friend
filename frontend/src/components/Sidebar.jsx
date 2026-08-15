import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  FileSearch,
  Globe2,
  Briefcase,
  GraduationCap,
  ClipboardList,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import FileUpload from "./FileUpload";

const MODES = [
  { id: "chat", label: "Chat", icon: MessageSquare, desc: "Ask me anything" },
  { id: "rag", label: "My Documents", icon: FileSearch, desc: "Q&A on your files" },
  { id: "research", label: "Research Agent", icon: Globe2, desc: "Live web search" },
  { id: "interview", label: "Interview Prep", icon: Briefcase, desc: "Mock interviews" },
  { id: "exam", label: "Exam Prep", icon: GraduationCap, desc: "Practice questions" },
  { id: "assignment", label: "Assignment Help", icon: ClipboardList, desc: "Solve & write" },
];

export default function Sidebar({
  mode,
  setMode,
  sessionId,
  files,
  setFiles,
  extra,
  setExtra,
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      
      <div className="md:hidden flex items-center justify-between px-4 py-2 bg-black/30 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-saffron-400 to-dost-500 shadow-glow">
            <Sparkles size={18} />
          </div>
          <p className="font-display text-lg font-bold leading-none">MeraDost</p>
        </div>
        <button onClick={() => setOpen(!open)} className="whitespace-nowrap rounded-full border border-white/15 px-3 py-1.5 text-sm text-white hover:bg-white/10 transition z-50">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      
      {open && (
        <div
          className="fixed inset-0 bg-black z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

    
      <aside
        className={`fixed md:static top-0 left-0 h-full min-w-full md:w-72 flex-shrink-0 flex-col border-r border-white/10 bg-black/20 p-4 transform transition-transform duration-300 ease-in-out z-40 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        
        <div className="mb-6 hidden md:flex items-center gap-2 px-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-saffron-400 to-dost-500 shadow-glow">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="font-display text-lg font-bold leading-none">MeraDost</p>
            <p className="text-[11px] text-slate-400">your AI study buddy</p>
          </div>
        </div>

 
        <nav className="space-y-1.5 overflow-y-auto pr-1">
          {MODES.map((m) => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <motion.button
                key={m.id}
                onClick={() => {
                  setMode(m.id);
                  setOpen(false);  
                }}
                whileTap={{ scale: 0.98 }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                  active
                    ? "bg-dost-500/20 border border-dost-400/40 text-white"
                    : "border border-transparent text-slate-300 hover:bg-white/5"
                }`}
              >
                <Icon size={17} className={active ? "text-dost-300" : "text-slate-400"} />
                <div>
                  <p className="text-sm font-medium">{m.label}</p>
                  <p className="text-[11px] text-slate-400">{m.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </nav>

         
        <div className="mt-6 flex-1 space-y-4 overflow-y-auto pr-1">
          {mode === "rag" && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Your Documents
              </p>
              <FileUpload sessionId={sessionId} files={files} setFiles={setFiles} />
            </div>
          )}

          {mode === "interview" && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Target Role
              </p>
              <input
                value={extra.role}
                onChange={(e) => setExtra({ ...extra, role: e.target.value })}
                placeholder="e.g. SDE Intern, Data Analyst"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-dost-400"
              />
            </div>
          )}

          {(mode === "exam" || mode === "assignment") && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Topic / Subject
              </p>
              <input
                value={extra.topic}
                onChange={(e) => setExtra({ ...extra, topic: e.target.value })}
                placeholder="e.g. Operating Systems, DBMS"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-dost-400"
              />
            </div>
          )}

          {mode === "exam" && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Difficulty
              </p>
              <div className="flex gap-2">
                {["easy", "medium", "hard"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setExtra({ ...extra, difficulty: d })}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-xs capitalize transition ${
                      extra.difficulty === d
                        ? "border-dost-400 bg-dost-500/20 text-white"
                        : "border-white/10 text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 truncate px-1 text-[10px] text-slate-500">
          Session: {sessionId.slice(0, 8)}
        </p>
      </aside>
    </>
  );
}
