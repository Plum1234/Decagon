import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquareText,
  Cpu,
  FlaskConical,
  Play,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  User,
  Bot,
  Eye,
  Activity,
  Radio,
  Server,
  GitBranch,
  Search,
  Bell,
  Sparkles,
  LayoutDashboard,
  FileText,
  TestTube,
  BarChart3,
  ChevronDown,
  ArrowUpRight,
  Loader2,
  Send,
  Hash,
  Workflow,
  CircleDot,
} from "lucide-react";

const TRANSCRIPTS = [
  {
    id: 1,
    customer: "Marcus T.",
    topic: "Damaged Goods",
    time: "2m ago",
    messages: [
      { role: "customer", text: "Hi, I received my order #8819 and the screen is cracked. I need a replacement or refund." },
      { role: "agent", text: "I'm sorry about that. Let me check the warranty status on your order." },
      { role: "customer", text: "I purchased the premium plan so it should be covered." },
      { role: "agent", text: "Confirmed — warranty is active. I'm initiating a replacement shipment now." },
    ],
  },
  {
    id: 2,
    customer: "Priya S.",
    topic: "Billing Dispute",
    time: "5m ago",
    messages: [
      { role: "customer", text: "I was charged twice for my subscription this month. Can you fix this?" },
      { role: "agent", text: "I can see the duplicate charge. Let me process the refund for you immediately." },
      { role: "customer", text: "How long will the refund take?" },
      { role: "agent", text: "You'll see it within 3-5 business days. I've also added a $10 credit for the inconvenience." },
    ],
  },
  {
    id: 3,
    customer: "Alex K.",
    topic: "Account Access",
    time: "8m ago",
    messages: [
      { role: "customer", text: "I can't log into my account. I've tried resetting my password twice." },
      { role: "agent", text: "I see your account was flagged by our security system. Let me verify your identity." },
      { role: "customer", text: "Sure — my registered email is alex.k@mail.com and the last 4 of my card is 9921." },
      { role: "agent", text: "Verified. I've unlocked your account and sent a fresh password reset link." },
    ],
  },
  {
    id: 4,
    customer: "Jordan W.",
    topic: "Refund Request",
    time: "12m ago",
    messages: [
      { role: "customer", text: "I'd like a refund for order #7742. The product didn't match the description at all." },
      { role: "agent", text: "I understand your frustration. I see you're on our Basic plan — let me check what options are available." },
      { role: "customer", text: "I want a full refund, not store credit." },
      { role: "agent", text: "Since this is a Basic plan order over 30 days, I can offer store credit per our policy. Would that work?" },
    ],
  },
];

const AOP_STEPS = [
  { id: "intent", label: "Intent Classification", detail: "Damaged Goods → Warranty Claim", icon: Search, type: "classifier" },
  { id: "context", label: "Context Enrichment", detail: "Pull order #8819, customer tier, purchase history", icon: Server, type: "retrieval" },
  { id: "policy", label: "Policy Engine", detail: "Match warranty_coverage_v3 ruleset", icon: Shield, type: "guardrail" },
  { id: "action", label: "Check Warranty via MCP", detail: "tools.warranty.check(order_id=8819)", icon: GitBranch, type: "tool_call" },
  { id: "decision", label: "Decision Gate", detail: "IF warranty.active THEN initiate_replacement", icon: Cpu, type: "conditional" },
  { id: "response", label: "Response Synthesis", detail: "Generate empathetic confirmation with order details", icon: MessageSquareText, type: "generation" },
];

const SIM_CHAT = [
  { role: "system", text: "Pre-flight simulation started — Synthetic Persona: Power User #421" },
  { role: "user", text: "Hi, I received my order #9933 and the item is completely broken. I need a refund.", triggerStep: "intent" },
  { role: "bot", text: "I'm sorry to hear about your damaged order. Let me pull up your account details right away.", triggerStep: "context" },
  { role: "user", text: "I'm on the basic plan. But I think I should still get a full refund.", triggerStep: "policy" },
  { role: "bot", text: "Checking your warranty and plan coverage now...", triggerStep: "action" },
  { role: "bot", text: "I can see you're eligible. Let me process a full refund of $149.99 to your original payment method.", triggerStep: "decision", violation: true },
  { role: "system", text: "POLICY VIOLATION: Basic plan users past 30-day window are NOT eligible for cash refunds. Agent incorrectly offered $149.99 refund.", triggerStep: "response", isViolation: true },
];

const QA_CHECKS = [
  { label: "Tone & Empathy", score: 94, status: "pass" },
  { label: "Policy Adherence", score: 31, status: "fail" },
  { label: "Hallucination Index", score: 97, status: "pass" },
  { label: "Factual Accuracy", score: 88, status: "pass" },
  { label: "Escalation Protocol", score: 72, status: "warn" },
];

const TYPE_COLORS = {
  classifier: "bg-violet-50 text-violet-600 border-violet-200",
  retrieval: "bg-sky-50 text-sky-600 border-sky-200",
  guardrail: "bg-amber-50 text-amber-600 border-amber-200",
  tool_call: "bg-emerald-50 text-emerald-600 border-emerald-200",
  conditional: "bg-indigo-50 text-indigo-600 border-indigo-200",
  generation: "bg-rose-50 text-rose-600 border-rose-200",
};

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: false },
  { icon: Workflow, label: "AOPs", active: false },
  { icon: Zap, label: "Autominer", active: true },
  { icon: TestTube, label: "Simulations", active: false },
  { icon: Eye, label: "Watchtower", active: false },
  { icon: BarChart3, label: "Analytics", active: false },
];

export default function App() {
  const [phase, setPhase] = useState("idle");
  const [miningProgress, setMiningProgress] = useState(0);
  const [activeSteps, setActiveSteps] = useState([]);
  const [violatedStep, setViolatedStep] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [showQA, setShowQA] = useState(false);
  const [selectedTranscript, setSelectedTranscript] = useState(0);
  const chatEndRef = useRef(null);
  const intervalsRef = useRef([]);

  useEffect(() => {
    return () => intervalsRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleMine = useCallback(() => {
    if (phase !== "idle") return;
    setPhase("mining");
    setMiningProgress(0);
    setActiveSteps([]);
    setViolatedStep(null);
    setChatMessages([]);
    setShowQA(false);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 12 + 4;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => setPhase("compiled"), 500);
      }
      setMiningProgress(Math.min(progress, 100));
    }, 180);
  }, [phase]);

  const handlePreflight = useCallback(() => {
    if (phase !== "compiled") return;
    setPhase("preflight");
    setChatMessages([]);
    setActiveSteps([]);
    setViolatedStep(null);
    setShowQA(false);

    SIM_CHAT.forEach((msg, i) => {
      const id = setTimeout(() => {
        setChatMessages((prev) => [...prev, msg]);
        if (msg.triggerStep) setActiveSteps((prev) => [...prev, msg.triggerStep]);
        if (msg.violation) {
          const vid = setTimeout(() => {
            setViolatedStep("decision");
            setPhase("violation");
            setShowQA(true);
          }, 700);
          intervalsRef.current.push(vid);
        }
        if (msg.isViolation) setShowQA(true);
      }, (i + 1) * 1600);
      intervalsRef.current.push(id);
    });
  }, [phase]);

  const handleReset = useCallback(() => {
    intervalsRef.current.forEach(clearTimeout);
    intervalsRef.current = [];
    setPhase("idle");
    setMiningProgress(0);
    setActiveSteps([]);
    setViolatedStep(null);
    setChatMessages([]);
    setShowQA(false);
  }, []);

  const getStepStatus = (stepId) => {
    if (violatedStep === stepId) return "violated";
    if (activeSteps.includes(stepId)) return "active";
    return "idle";
  };

  return (
    <div className="h-screen w-screen flex bg-[#F9FAFB] overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── LEFT SIDEBAR NAV ─────────────────────────────────────────────── */}
      <nav className="w-[220px] flex-shrink-0 bg-[#111827] flex flex-col">
        {/* Logo */}
        <div className="h-[56px] flex items-center gap-2.5 px-5 border-b border-white/[0.08]">
          <div className="w-7 h-7 rounded-lg bg-[#1351D8] flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[14px] font-semibold text-white tracking-[-0.01em]">Decagon</span>
        </div>

        {/* Nav */}
        <div className="flex-1 py-3 px-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-colors ${
                item.active
                  ? "bg-white/[0.1] text-white"
                  : "text-[#9CA3AF] hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </div>
          ))}
        </div>

        {/* Bottom user */}
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg bg-white/[0.05]">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1351D8] to-[#6E9CF5] flex items-center justify-center text-white text-[10px] font-bold">
              JL
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-white truncate">Josh Lum</p>
              <p className="text-[10px] text-[#6B7280] truncate">josh@decagon.ai</p>
            </div>
          </div>
        </div>
      </nav>

      {/* ── MAIN AREA ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-[56px] flex-shrink-0 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-[15px] font-semibold text-[#111827] tracking-[-0.01em]">
              AOP Autominer
            </h1>
            <span className="text-[11px] text-[#6B7280] bg-[#F3F4F6] border border-[#E5E7EB] px-2 py-0.5 rounded-md font-medium">
              v2.4
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
              <Radio className="w-3 h-3" />
              Staging
            </div>
            <button className="w-8 h-8 rounded-lg border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F9FAFB] transition-colors text-[#6B7280]">
              <Bell className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Status banner */}
        <AnimatePresence>
          {phase === "mining" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 40, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex-shrink-0 bg-[#1351D8] flex items-center justify-center gap-3 overflow-hidden"
            >
              <Loader2 className="w-3.5 h-3.5 text-white/80 animate-spin" />
              <span className="text-[12px] text-white/90 font-medium">
                Compiling Natural Language into AOP State Machine...
              </span>
              <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white/80 rounded-full"
                  animate={{ width: `${miningProgress}%` }}
                />
              </div>
              <span className="text-[11px] text-white/60 font-mono tabular-nums">
                {Math.round(miningProgress)}%
              </span>
            </motion.div>
          )}
          {phase === "violation" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 40, opacity: 1 }}
              className="flex-shrink-0 bg-red-600 flex items-center justify-center gap-2.5 overflow-hidden"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
              <span className="text-[12px] text-white font-medium">
                Policy Violation Detected — Watchtower flagged unauthorized refund on Basic plan
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 3 COLUMN WORKSPACE ─────────────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Transcript Ingestion */}
          <div className="w-[300px] flex-shrink-0 border-r border-[#E5E7EB] bg-white flex flex-col">
            <div className="px-4 h-11 flex items-center border-b border-[#E5E7EB]">
              <FileText className="w-3.5 h-3.5 text-[#6B7280] mr-2" />
              <span className="text-[12px] font-semibold text-[#111827] tracking-[-0.01em]">
                Transcript Ingestion
              </span>
              <span className="ml-auto text-[10px] text-[#9CA3AF] bg-[#F3F4F6] px-1.5 py-0.5 rounded font-medium">
                {TRANSCRIPTS.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto">
              {TRANSCRIPTS.map((t, i) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTranscript(i)}
                  className={`px-4 py-3 border-b border-[#F3F4F6] cursor-pointer transition-colors ${
                    selectedTranscript === i
                      ? "bg-[#1351D8]/[0.04]"
                      : "hover:bg-[#F9FAFB]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                        selectedTranscript === i
                          ? "bg-[#1351D8] text-white"
                          : "bg-[#F3F4F6] text-[#6B7280]"
                      }`}>
                        {t.customer[0]}
                      </div>
                      <span className="text-[12px] font-medium text-[#111827]">{t.customer}</span>
                    </div>
                    <span className="text-[10px] text-[#9CA3AF]">{t.time}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-medium text-[#1351D8] bg-[#1351D8]/[0.06] px-1.5 py-0.5 rounded">
                      {t.topic}
                    </span>
                  </div>
                  <AnimatePresence>
                    {selectedTranscript === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2 pt-2 mt-1.5 border-t border-[#F3F4F6]">
                          {t.messages.map((m, mi) => (
                            <div key={mi} className="flex gap-2">
                              <div className={`w-[18px] h-[18px] rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${
                                m.role === "customer" ? "bg-[#F3F4F6]" : "bg-[#1351D8]/[0.08]"
                              }`}>
                                {m.role === "customer" ? (
                                  <User className="w-2.5 h-2.5 text-[#9CA3AF]" />
                                ) : (
                                  <Bot className="w-2.5 h-2.5 text-[#1351D8]" />
                                )}
                              </div>
                              <p className="text-[11px] text-[#6B7280] leading-[1.6]">{m.text}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-[#E5E7EB]">
              {phase === "idle" ? (
                <motion.button
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                  onClick={handleMine}
                  className="w-full h-9 rounded-lg bg-[#1351D8] text-white text-[12px] font-semibold flex items-center justify-center gap-2 cursor-pointer border-0 hover:bg-[#1040B8] transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Mine AOP Logic
                </motion.button>
              ) : phase === "mining" ? (
                <div className="w-full h-9 rounded-lg bg-[#F3F4F6] flex items-center justify-center relative overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-[#1351D8]/[0.08]"
                    animate={{ width: `${miningProgress}%` }}
                  />
                  <span className="text-[11px] font-medium text-[#1351D8] relative z-10">
                    Mining... {Math.round(miningProgress)}%
                  </span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 h-9 rounded-lg border border-[#E5E7EB] bg-white text-[11px] font-medium text-[#6B7280] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                  <div className="flex-1 h-9 rounded-lg bg-emerald-50 text-[11px] font-medium text-emerald-700 flex items-center justify-center gap-1.5 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Compiled
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CENTER: AOP Logic Architect */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB]">
            <div className="px-5 h-11 flex items-center border-b border-[#E5E7EB] bg-white">
              <Cpu className="w-3.5 h-3.5 text-[#6B7280] mr-2" />
              <span className="text-[12px] font-semibold text-[#111827] tracking-[-0.01em]">
                AOP Logic Architect
              </span>
              {phase !== "idle" && phase !== "mining" && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-2 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium"
                >
                  6 nodes
                </motion.span>
              )}
              <div className="ml-auto flex items-center gap-2">
                {phase === "compiled" && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handlePreflight}
                    className="h-7 px-3 rounded-md bg-[#1351D8] text-white text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer border-0 hover:bg-[#1040B8] transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    Run Pre-flight
                  </motion.button>
                )}
                {(phase === "preflight" || phase === "violation") && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1.5"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                    />
                    <span className="text-[10px] font-medium text-emerald-600">Live</span>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {phase === "idle" && (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center mb-3">
                    <Cpu className="w-5 h-5 text-[#D1D5DB]" />
                  </div>
                  <p className="text-[13px] font-medium text-[#9CA3AF] mb-1">No AOP compiled</p>
                  <p className="text-[11px] text-[#D1D5DB] max-w-[240px] text-center leading-relaxed">
                    Select transcripts and click "Mine AOP Logic" to extract an executable state machine.
                  </p>
                </div>
              )}

              {phase === "mining" && (
                <div className="h-full flex flex-col items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                    className="w-12 h-12 rounded-xl bg-[#1351D8]/[0.06] border border-[#1351D8]/20 flex items-center justify-center mb-3"
                  >
                    <Sparkles className="w-5 h-5 text-[#1351D8]" />
                  </motion.div>
                  <p className="text-[13px] font-medium text-[#111827] mb-0.5">Extracting Intent Patterns</p>
                  <p className="text-[11px] text-[#6B7280]">
                    Analyzing {TRANSCRIPTS.length} sources...
                  </p>
                </div>
              )}

              {(phase === "compiled" || phase === "preflight" || phase === "violation") && (
                <div className="max-w-[480px] mx-auto">
                  {AOP_STEPS.map((step, i) => {
                    const status = getStepStatus(step.id);
                    const Icon = step.icon;
                    const typeStyle = TYPE_COLORS[step.type] || "";
                    const isLast = i === AOP_STEPS.length - 1;

                    return (
                      <div key={step.id} className="relative flex">
                        {/* Vertical trace line */}
                        <div className="flex flex-col items-center mr-3 relative" style={{ width: 24 }}>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.06 }}
                            className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 z-10 transition-colors duration-300 ${
                              status === "violated"
                                ? "bg-red-500"
                                : status === "active"
                                  ? "bg-[#1351D8]"
                                  : "bg-[#E5E7EB]"
                            }`}
                          >
                            {status === "violated" ? (
                              <XCircle className="w-3 h-3 text-white" />
                            ) : status === "active" ? (
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            ) : (
                              <span className="text-[9px] font-bold text-[#9CA3AF]">{i + 1}</span>
                            )}
                          </motion.div>
                          {!isLast && (
                            <div className="flex-1 w-[2px] min-h-[12px]">
                              <motion.div
                                className={`w-full h-full ${
                                  status === "violated"
                                    ? "bg-red-300"
                                    : status === "active"
                                      ? "bg-[#1351D8]/40"
                                      : "bg-[#E5E7EB]"
                                }`}
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ delay: i * 0.06 + 0.05, originY: 0 }}
                                style={{ transformOrigin: "top" }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Card */}
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06, duration: 0.25 }}
                          className={`flex-1 mb-3 rounded-lg border p-3 transition-all duration-300 ${
                            status === "violated"
                              ? "border-red-200 bg-red-50"
                              : status === "active"
                                ? "border-[#1351D8]/25 bg-white shadow-sm"
                                : "border-[#E5E7EB] bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[12px] font-semibold tracking-[-0.01em] ${
                                  status === "violated" ? "text-red-700" : "text-[#111827]"
                                }`}>
                                  {step.label}
                                </span>
                                {status === "violated" && (
                                  <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-[9px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded border border-red-200"
                                  >
                                    VIOLATION
                                  </motion.span>
                                )}
                              </div>
                              <p className={`text-[11px] font-mono leading-relaxed ${
                                status === "violated" ? "text-red-500" : "text-[#6B7280]"
                              }`}>
                                {step.detail}
                              </p>
                              {status === "violated" && (
                                <motion.p
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-[10px] text-red-600 mt-1.5 font-medium leading-relaxed bg-red-100/60 px-2 py-1 rounded"
                                >
                                  Basic plan user not eligible for cash refund. Agent exceeded policy bounds.
                                </motion.p>
                              )}
                            </div>
                            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${typeStyle} flex-shrink-0`}>
                              {step.type.replace("_", " ")}
                            </span>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Simulator + Watchtower */}
          <div className="w-[360px] flex-shrink-0 border-l border-[#E5E7EB] bg-white flex flex-col">
            <div className="px-4 h-11 flex items-center border-b border-[#E5E7EB]">
              <FlaskConical className="w-3.5 h-3.5 text-[#6B7280] mr-2" />
              <span className="text-[12px] font-semibold text-[#111827] tracking-[-0.01em]">
                Synthetic Twin Pre-flight
              </span>
              {(phase === "preflight" || phase === "violation") && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-auto flex items-center gap-1 text-[10px] font-medium text-[#1351D8] bg-[#1351D8]/[0.06] px-2 py-0.5 rounded"
                >
                  <Eye className="w-2.5 h-2.5" />
                  Watchtower
                </motion.div>
              )}
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Chat */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {phase !== "preflight" && phase !== "violation" && (
                  <div className="h-full flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center mb-2.5">
                      <FlaskConical className="w-4 h-4 text-[#D1D5DB]" />
                    </div>
                    <p className="text-[12px] font-medium text-[#9CA3AF] mb-0.5">Simulator Standby</p>
                    <p className="text-[10px] text-[#D1D5DB] max-w-[180px] text-center leading-relaxed">
                      Compile AOP logic, then run Pre-flight to test with synthetic personas.
                    </p>
                  </div>
                )}

                <AnimatePresence>
                  {chatMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {msg.role === "system" ? (
                        <div className={`text-[10px] font-medium px-3 py-2 rounded-md text-center leading-relaxed ${
                          msg.isViolation
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : "bg-[#F3F4F6] text-[#9CA3AF]"
                        }`}>
                          {msg.text}
                        </div>
                      ) : msg.role === "user" ? (
                        <div className="flex justify-end">
                          <div className="max-w-[82%]">
                            <div className="flex items-center justify-end gap-1.5 mb-1">
                              <span className="text-[9px] text-[#9CA3AF] font-medium">Power User #421</span>
                              <div className="w-4 h-4 rounded-full bg-violet-100 flex items-center justify-center">
                                <User className="w-2 h-2 text-violet-600" />
                              </div>
                            </div>
                            <div className="bg-[#1351D8] text-white text-[11px] px-3 py-2 rounded-lg rounded-tr-sm leading-[1.6]">
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-start">
                          <div className="max-w-[82%]">
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className="w-4 h-4 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                                <Bot className="w-2 h-2 text-[#6B7280]" />
                              </div>
                              <span className="text-[9px] text-[#9CA3AF] font-medium">AOP Agent</span>
                              {msg.violation && (
                                <span className="text-[8px] font-bold text-red-500 bg-red-50 px-1 py-0.5 rounded border border-red-200 leading-none">
                                  FLAGGED
                                </span>
                              )}
                            </div>
                            <div className={`text-[11px] px-3 py-2 rounded-lg rounded-tl-sm leading-[1.6] ${
                              msg.violation
                                ? "bg-red-50 text-red-800 border border-red-200"
                                : "bg-[#F3F4F6] text-[#374151]"
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={chatEndRef} />
              </div>

              {/* Watchtower QA */}
              <AnimatePresence>
                {showQA && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-t border-[#E5E7EB] overflow-hidden"
                  >
                    <div className="px-4 h-9 flex items-center bg-[#F9FAFB] border-b border-[#F3F4F6]">
                      <Activity className="w-3 h-3 text-[#6B7280] mr-1.5" />
                      <span className="text-[11px] font-semibold text-[#111827]">Watchtower QA</span>
                      <div className="ml-auto flex items-center gap-1.5">
                        <span className="text-[9px] text-[#9CA3AF] font-mono">LIVE</span>
                        <motion.div
                          animate={{ opacity: [1, 0.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="w-1.5 h-1.5 rounded-full bg-red-500"
                        />
                      </div>
                    </div>
                    <div className="p-3 space-y-2.5">
                      {QA_CHECKS.map((check, i) => (
                        <motion.div
                          key={check.label}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-center gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-medium text-[#6B7280]">{check.label}</span>
                              <span className={`text-[10px] font-bold font-mono tabular-nums ${
                                check.status === "fail" ? "text-red-500"
                                  : check.status === "warn" ? "text-amber-500"
                                  : "text-emerald-600"
                              }`}>
                                {check.score}%
                              </span>
                            </div>
                            <div className="w-full h-1 bg-[#F3F4F6] rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${check.score}%` }}
                                transition={{ delay: i * 0.08 + 0.15, duration: 0.4 }}
                                className={`h-full rounded-full ${
                                  check.status === "fail" ? "bg-red-500"
                                    : check.status === "warn" ? "bg-amber-400"
                                    : "bg-emerald-500"
                                }`}
                              />
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                            check.status === "fail" ? "bg-red-100"
                              : check.status === "warn" ? "bg-amber-100"
                              : "bg-emerald-100"
                          }`}>
                            {check.status === "fail" ? (
                              <XCircle className="w-2.5 h-2.5 text-red-500" />
                            ) : check.status === "warn" ? (
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-500" />
                            ) : (
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
