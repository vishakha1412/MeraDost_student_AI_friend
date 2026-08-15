import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import {
  Sparkles,
  FileSearch,
  Globe2,
  Briefcase,
  GraduationCap,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";

const FEATURES = [
  { icon: FileSearch, title: "Chat with your notes", desc: "Upload PDFs/DOCX and ask questions - answered straight from your material." },
  { icon: Globe2, title: "Research Agent", desc: "Live web search powered by Tavily for up-to-date, cited answers." },
  { icon: Briefcase, title: "Mock Interviews", desc: "Role-based interview practice with real-time feedback." },
  { icon: GraduationCap, title: "Exam Prep", desc: "Practice questions, evaluation, and model answers for any subject." },
  { icon: ClipboardList, title: "Assignment Helper", desc: "Understand concepts and draft assignments the right way." },
  { icon: Sparkles, title: "And more...", desc: "We are constantly adding new features to make your college life easier." },
];

function Landing({ onStart }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-dost-radial">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-saffron-400 to-dost-500 shadow-glow">
            <Sparkles size={18} />
          </div>
          <span className="font-display text-xl font-bold">MeraDost</span>
        </div>
        <button
          onClick={onStart}
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/10 transition"
        >
          Launch App
        </button>
      </nav>

      <header className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-300"
        >
          🎓 Built for students, by a student - VISHAKHA SHARMA
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl font-extrabold leading-tight sm:text-5xl"
        >
          One AI dost for <span className="text-dost-300">everything</span> college
          throws at you.
        </motion.h1>
        

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 max-w-2xl text-slate-300"
        >
          Chat, upload documents for RAG-powered Q&A, prep for interviews and
          exams, get help with assignments, and research anything on the live
          web - all in one place.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onClick={onStart}
          className="mt-8 flex items-center gap-2 rounded-full bg-dost-500 px-6 py-3 text-sm font-semibold text-white shadow-glow hover:bg-dost-600 transition"
        >
          Start chatting free <ArrowRight size={16} />
        </motion.button>
      </header>


  <div className="overflow-hidden max-w-4xl mt-8 py-2 mx-auto rounded-full border border-white/10 bg-white/5  hover:scale-110 transition hover:ease-in-out hover:duration-300 hover:shadow-sm">
  <motion.div
    className="flex gap-9 w-[200%] px-6 mx-4"
    animate={{ x: ["0%", "-50%"] }}
    transition={{ repeat: Infinity, duration: 10, ease: "linear", repeatType: "mirror" }}
  >
    {[...FEATURES, ...FEATURES].map((feature, idx) => (
      <div
        key={idx}
        className="flex-shrink-0 w-[60px] bg-white  rounded-full p-3 hover:shadow-xl transition text-center items-center justify-center flex flex-col gap-1 border border-blue/10 shadow-glow hover:scale-110  hover:ease-in-out hover:duration-300  "
      >
        <feature.icon className="text-indigo-600 text-md mb-1" />
      </div>
    ))}
  </motion.div>
</div>

      <section className="mx-auto mt-10 grid max-w-7xl grid-cols-1 gap-4 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-3 hover:scale-110 transition hover:ease-in-out hover:duration-300 hover:shadow-sm">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:scale-110 transition hover:ease-in-out   hover:shadow-sm "
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-dost-500/20 ">
                <Icon size={18} className="text-dost-300" />
              </div>
              <p className="font-display font-semibold">{f.title}</p>
              <p className="mt-1 text-sm text-slate-400">{f.desc}</p>
            </motion.div>
          );
        })}
      </section>

      
    </div>
  );
}

export default function App() {
  const [started, setStarted] = useState(false);
  const [sessionId] = useState(() => uuidv4());
  const [mode, setMode] = useState("chat");
  const [files, setFiles] = useState([]);
  const [extra, setExtra] = useState({ topic: "", role: "", difficulty: "medium" });

  if (!started) return <Landing onStart={() => setStarted(true)} />;

  return (
   <div className="flex h-screen bg-ink text-slate-100 flex-col md:flex-row">
 
  <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-white/10 z-100">
    <Sidebar
      mode={mode}
      setMode={setMode}
      sessionId={sessionId}
      files={files}
      setFiles={setFiles}
      extra={extra}
      setExtra={setExtra}
    />
  </div>

  
  <div className="flex-1">
    <ChatWindow sessionId={sessionId} mode={mode} extra={extra} />
  </div>
</div>
  );
}
