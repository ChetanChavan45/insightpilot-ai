"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Search,
  Cpu,
  FileText,
  Mail,
  Database,
  ArrowRight,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  Eye,
  Settings,
  History,
  Building,
  Info,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Layout,
  Layers,
  Award,
  Zap,
  ShieldCheck,
  Clock,
  Server,
  BarChart3
} from "lucide-react";
import { executeIntakeWorkflow, getWorkflowLogs } from "../actions/workflow";

// Zod schema matching Zod validations in server action
const leadFormSchema = z.object({
  fullName: z.string().min(2, "Full Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").refine((val) => {
    const domain = val.split("@")[1]?.toLowerCase() || "";
    const personalDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "aol.com"];
    return !personalDomains.includes(domain);
  }, "Please provide a valid work email address (non-Gmail/Yahoo)"),
  companyName: z.string().min(2, "Company Name must be at least 2 characters"),
  website: z.string().min(3, "Website is required").refine((val) => {
    const pattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
    return pattern.test(val);
  }, "Invalid website domain format"),
  industry: z.string().optional(),
  message: z.string().optional(),
});

type FormInput = z.infer<typeof leadFormSchema>;

export default function Home() {
  const [activeTab, setActiveTab] = useState<"audit" | "admin">("audit");
  const [workflowStatus, setWorkflowStatus] = useState<"idle" | "running" | "success" | "failed">("idle");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [workflowLogs, setWorkflowLogs] = useState<any[]>([]);
  const [workflowResult, setWorkflowResult] = useState<any>(null);
  const [pastLeads, setPastLeads] = useState<any[]>([]);
  const [selectedLeadDetail, setSelectedLeadDetail] = useState<any>(null);
  const [selectedReportTab, setSelectedReportTab] = useState("exec");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  // Highly professional stages matching the requirements
  const stepsList = [
    { id: "LEAD_CAPTURE", label: "Validating Lead", desc: "Verifying corporate domains and capturing details", icon: ShieldCheck },
    { id: "RESEARCH", label: "Researching Company", desc: "Crawling public directories, meta headers, and assets", icon: Search },
    { id: "INSIGHTS", label: "Gathering Insights", desc: "Extracting SEO observations and product frameworks", icon: Layers },
    { id: "AI_GEN", label: "Generating AI Audit", desc: "Synthesizing professional McKinsey-style consulting reports", icon: Cpu },
    { id: "PDF_GEN", label: "Compiling PDF", desc: "Composing high-fidelity consulting report layout", icon: FileText },
    { id: "EMAIL", label: "Sending Email", desc: "Dispatching PDF report and custom templates via Resend", icon: Mail }
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormInput>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      companyName: "",
      website: "",
      industry: "SaaS & Software",
      message: "",
    },
  });

  // Load past leads from DB on admin tab click
  useEffect(() => {
    if (activeTab === "admin") {
      loadPastLeads();
    }
  }, [activeTab]);

  const loadPastLeads = async () => {
    const res = await getWorkflowLogs();
    if (res.success && res.leads) {
      setPastLeads(res.leads);
      if (res.leads.length > 0 && !selectedLeadDetail) {
        setSelectedLeadDetail(res.leads[0]);
      }
    }
  };

  const onSubmit = async (data: FormInput) => {
    setWorkflowStatus("running");
    setCurrentStepIndex(0);
    setWorkflowLogs([]);
    setErrorMessage("");

    // Simulate progress ticks to give the user a beautiful state feedback
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < 5) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 4500);

    startTransition(async () => {
      try {
        const result = await executeIntakeWorkflow(data);
        clearInterval(stepInterval);

        if (result.success) {
          setWorkflowResult(result);
          setWorkflowStatus("success");
          setCurrentStepIndex(5);
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#3b82f6", "#10b981", "#ffffff"],
          });
          reset();
        } else {
          setWorkflowStatus("failed");
          setErrorMessage(result.error || "Workflow processing failed. Check inputs.");
        }
      } catch (err) {
        clearInterval(stepInterval);
        setWorkflowStatus("failed");
        setErrorMessage("A critical network error occurred during workflow execution.");
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* NAVIGATION HEADER */}
      <header className="glass sticky top-0 z-50 px-6 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center glow-primary">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
              InsightPilot AI
            </h1>
            <p className="text-[9px] text-emerald-400 font-mono tracking-widest uppercase">
              Transformation Engine
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
              activeTab === "audit"
                ? "bg-blue-600 text-white glow-primary"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Request Audit
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center space-x-1.5 ${
              activeTab === "admin"
                ? "bg-slate-800 text-white border border-slate-700 glow-accent"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Admin Intake logs</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {activeTab === "audit" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-16"
            >
              {/* HERO & FORM SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* HERO COPY */}
                <div className="lg:col-span-5 flex flex-col space-y-6">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/20 text-blue-400 text-xs w-fit">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold">Professional Assessment MVP</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
                    AI-Powered Business{" "}
                    <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent block mt-1">
                      Intelligence Reports Delivered Instantly
                    </span>
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Turn every inbound lead into a personalized consulting experience using AI automation, enrichment pipelines, and intelligent audit generation.
                  </p>

                  {/* Micro metrics with cleaner styles */}
                  <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800/80">
                    <div className="flex items-start space-x-2">
                      <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-white">&lt; 30s</h4>
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider">Analysis Speed</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Server className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-white">100%</h4>
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider">Fully Autonomous</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Award className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-white">Premium</h4>
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider">Consulting style</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FORM CARD / INTERACTIVE ENGINE CONTAINER */}
                <div className="lg:col-span-7">
                  <div className="glass-premium rounded-3xl p-6 md:p-8 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                      {/* IDLE: LEAD CAPTURE FORM */}
                      {workflowStatus === "idle" && (
                        <motion.div
                          key="lead-intake-form"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <div className="flex items-center space-x-2.5 mb-2">
                            <Building className="w-5 h-5 text-blue-400" />
                            <h3 className="text-lg font-bold text-white">Digital Intelligence Form</h3>
                          </div>
                          <p className="text-xs text-slate-400 mb-6">
                            Submit company parameters below. The platform scrapes target DOMs, compiles generative insights, and dispatches McKinsey-style audits autonomously.
                          </p>

                          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                                  Full Name
                                </label>
                                <input
                                  {...register("fullName")}
                                  type="text"
                                  placeholder="Chetan Sharma"
                                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
                                />
                                {errors.fullName && (
                                  <p className="text-[10px] text-rose-500 mt-1">{errors.fullName.message}</p>
                                )}
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                                  Corporate Email
                                </label>
                                <input
                                  {...register("email")}
                                  type="email"
                                  placeholder="chetan@mybusiness.com"
                                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
                                />
                                {errors.email && (
                                  <p className="text-[10px] text-rose-500 mt-1">{errors.email.message}</p>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                                  Company Name
                                </label>
                                <input
                                  {...register("companyName")}
                                  type="text"
                                  placeholder="Vercel"
                                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
                                />
                                {errors.companyName && (
                                  <p className="text-[10px] text-rose-500 mt-1">{errors.companyName.message}</p>
                                )}
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                                  Website Domain
                                </label>
                                <input
                                  {...register("website")}
                                  type="text"
                                  placeholder="vercel.com"
                                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
                                />
                                {errors.website && (
                                  <p className="text-[10px] text-rose-500 mt-1">{errors.website.message}</p>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                                  Primary Industry (Optional)
                                </label>
                                <select
                                  {...register("industry")}
                                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
                                >
                                  <option value="SaaS & Software">SaaS & Software</option>
                                  <option value="Financial Services">Financial Services</option>
                                  <option value="Healthcare & Wellness">Healthcare & Wellness</option>
                                  <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                                  <option value="Consulting & Agency">Consulting & Agency</option>
                                  <option value="Education & Learning">Education & Learning</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                                Brief Message (Optional)
                              </label>
                              <textarea
                                {...register("message")}
                                rows={2}
                                placeholder="Describe your primary growth challenge..."
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 resize-none"
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white text-xs font-bold transition duration-300 flex items-center justify-center space-x-2 glow-primary cursor-pointer"
                            >
                              <span>Trigger Analysis Pipeline</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </form>
                        </motion.div>
                      )}

                      {/* RUNNING WORKFLOW LOADING INTERFACE */}
                      {workflowStatus === "running" && (
                        <motion.div
                          key="running-progress-stages"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="py-4"
                        >
                          <div className="flex items-center space-x-3 mb-6">
                            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                            <div>
                              <h3 className="text-lg font-bold text-white">Running Audit Workflow</h3>
                              <p className="text-xs text-slate-400">Processing real-time company intelligence...</p>
                            </div>
                          </div>

                          {/* STEP PROGRESS MATRIX */}
                          <div className="space-y-3.5">
                            {stepsList.map((step, idx) => {
                              const Icon = step.icon;
                              let status: "pending" | "running" | "done" = "pending";

                              if (idx < currentStepIndex) status = "done";
                              else if (idx === currentStepIndex) status = "running";

                              return (
                                <div
                                  key={step.id}
                                  className={`flex items-start space-x-4 p-3 rounded-xl border transition-all duration-350 ${
                                    status === "running"
                                      ? "bg-blue-950/40 border-blue-500/40 glow-primary"
                                      : status === "done"
                                      ? "bg-emerald-950/20 border-emerald-500/20 opacity-80"
                                      : "bg-slate-900/30 border-slate-800/50 opacity-40"
                                  }`}
                                >
                                  <div
                                    className={`p-2 rounded-lg transition-colors ${
                                      status === "running"
                                        ? "bg-blue-600 text-white animate-pulse"
                                        : status === "done"
                                        ? "bg-emerald-600 text-white"
                                        : "bg-slate-850 text-slate-500"
                                    }`}
                                  >
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-xs font-bold text-white">{step.label}</h4>
                                      {status === "done" && (
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                      )}
                                      {status === "running" && (
                                        <span className="text-[10px] text-blue-400 font-semibold animate-pulse shrink-0">
                                          Processing...
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{step.desc}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}

                      {/* REPORT SUCCESS COMPONENT */}
                      {workflowStatus === "success" && workflowResult && (
                        <motion.div
                          key="success-report-result"
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-6"
                        >
                          <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between pb-4 border-b border-slate-800">
                            <div>
                              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold mb-2">
                                <CheckCircle className="w-3 h-3" />
                                <span>Audit Synthesized</span>
                              </div>
                              <h3 className="text-xl font-bold text-white">
                                {workflowResult.enrichedData.companyName} Analysis
                              </h3>
                              <a
                                href={workflowResult.enrichedData.website}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 mt-0.5"
                              >
                                <span>{workflowResult.enrichedData.website}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>

                            <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-blue-950/40 border border-blue-500/30 px-4 py-2.5 rounded-2xl glow-primary">
                              <div className="text-center">
                                <span className="text-2xl font-black text-white">
                                  {workflowResult.enrichedData.seoScore}
                                </span>
                                <span className="text-[9px] text-slate-400 block font-mono">SEO SCORE</span>
                              </div>
                              <div className="border-l border-blue-500/30 pl-3">
                                <span className="text-[10px] text-emerald-400 font-semibold block uppercase">
                                  Premium
                                </span>
                                <span className="text-[9px] text-slate-400 block">Consulting Grade</span>
                              </div>
                            </div>
                          </div>

                          {/* METADATA & SERVICES DETECTED */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
                              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
                                Detected Industry
                              </span>
                              <span className="text-xs font-bold text-white block mt-0.5">
                                {workflowResult.enrichedData.industry}
                              </span>
                            </div>
                            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
                              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
                                Tech Stack hints
                              </span>
                              <span className="text-xs font-bold text-white block mt-0.5 truncate">
                                {workflowResult.enrichedData.techStackHints.slice(0, 3).join(", ") || "Vanilla JS"}
                              </span>
                            </div>
                          </div>

                          {/* TABBED AUDIT PREVIEW */}
                          <div>
                            <div className="flex border-b border-slate-800 overflow-x-auto text-xs pb-1.5 mb-3 gap-2">
                              {[
                                { id: "exec", label: "Executive Summary" },
                                { id: "seo", label: "UX & SEO Performance" },
                                { id: "ai", label: "AI Automation Plan" },
                                { id: "roadmap", label: "90-Day Roadmap" }
                              ].map((tab) => (
                                <button
                                  key={tab.id}
                                  onClick={() => setSelectedReportTab(tab.id)}
                                  className={`px-2.5 py-1 rounded-md transition-all shrink-0 font-semibold cursor-pointer ${
                                    selectedReportTab === tab.id
                                      ? "bg-slate-800 text-blue-400 border border-blue-500/20"
                                      : "text-slate-400 hover:text-white"
                                  }`}
                                >
                                  {tab.label}
                                </button>
                              ))}
                            </div>

                            <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60 max-h-[160px] overflow-y-auto text-xs leading-relaxed text-slate-300 scrollbar">
                              {selectedReportTab === "exec" && workflowResult.reportData.executiveSummary}
                              {selectedReportTab === "seo" && (
                                <div className="space-y-2">
                                  <p>{workflowResult.reportData.uxObservations}</p>
                                  <p>{workflowResult.reportData.seoObservations}</p>
                                </div>
                              )}
                              {selectedReportTab === "ai" && workflowResult.reportData.aiOpportunities}
                              {selectedReportTab === "roadmap" && workflowResult.reportData.strategicSuggestions}
                            </div>
                          </div>

                          {/* DOWNLOAD ACTION ROW */}
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
                            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
                              <Mail className="w-4 h-4 shrink-0" />
                              <span>Delivered to {workflowResult.enrichedData.website.replace(/^https?:\/\//i, "")}'s domain inbox!</span>
                            </div>
                            
                            {workflowResult.pdfPath && (
                              <a
                                href={workflowResult.pdfPath}
                                download
                                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition duration-300 flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
                              >
                                <Download className="w-4 h-4" />
                                <span>Get McKinsey Report (PDF)</span>
                              </a>
                            )}
                          </div>

                          <button
                            onClick={() => setWorkflowStatus("idle")}
                            className="text-[10px] text-slate-400 hover:text-white block mx-auto pt-2 transition cursor-pointer"
                          >
                            Request another corporate report
                          </button>
                        </motion.div>
                      )}

                      {/* WORKFLOW FAILED COMPONENT */}
                      {workflowStatus === "failed" && (
                        <motion.div
                          key="failed-alert-card"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-6"
                        >
                          <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                          <h3 className="text-lg font-bold text-white">Workflow Execution Halted</h3>
                          <p className="text-xs text-rose-400 bg-rose-950/20 border border-rose-500/20 px-4 py-2.5 rounded-xl mt-3 max-w-md mx-auto">
                            {errorMessage}
                          </p>
                          
                          <div className="mt-8">
                            <button
                              onClick={() => setWorkflowStatus("idle")}
                              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
                            >
                              Return to Lead Capture Form
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* FEATURES GRID & TIMELINE IN QUANTIFIABLE SaaS DETAILS */}
              <div className="pt-16 border-t border-slate-800/80 space-y-16">
                {/* ADVANCED SERVICES */}
                <div className="space-y-8">
                  <div className="text-center space-y-2 max-w-xl mx-auto">
                    <h3 className="text-2xl font-bold text-white">Engineered for Startup Growth</h3>
                    <p className="text-xs text-slate-400">
                      Our system extracts publicly available indicators to construct deep operational intelligence.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      {
                        title: "Automated Research",
                        desc: "Scrapes target HTML content, meta tags, and alt tag parameters dynamically.",
                        icon: Search,
                        color: "from-blue-600/20 to-blue-500/5",
                        border: "border-blue-500/25"
                      },
                      {
                        title: "Cognitive Synthesizer",
                        desc: "Formulates bespoke AI agent strategies and operational automation workflows.",
                        icon: Cpu,
                        color: "from-emerald-600/20 to-emerald-500/5",
                        border: "border-emerald-500/25"
                      },
                      {
                        title: "Dynamic PDF Compiler",
                        desc: "Compiles premium, beautifully styled consulting-style PDFs on the server.",
                        icon: FileText,
                        color: "from-purple-600/20 to-purple-500/5",
                        border: "border-purple-500/25"
                      },
                      {
                        title: "Resend Automation",
                        desc: "Instantly dispatches branded, highly personalized emails with PDF attachments.",
                        icon: Mail,
                        color: "from-indigo-600/20 to-indigo-500/5",
                        border: "border-indigo-500/25"
                      }
                    ].map((feature, idx) => {
                      const Icon = feature.icon;
                      return (
                        <div
                          key={idx}
                          className={`p-6 rounded-2xl border ${feature.border} bg-gradient-to-br ${feature.color} backdrop-blur-sm hover:scale-[1.02] transition-transform duration-300`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center mb-4 text-white">
                            <Icon className="w-4 h-4" />
                          </div>
                          <h4 className="text-sm font-bold text-white mb-2">{feature.title}</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{feature.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* VISUAL TIMELINE */}
                <div className="space-y-8">
                  <div className="text-center space-y-2 max-w-xl mx-auto">
                    <h3 className="text-2xl font-bold text-white">Transparent Lifecycle Trace</h3>
                    <p className="text-xs text-slate-400">
                      Every submission undergoes standard validation and telemetry logging across 6 processing steps.
                    </p>
                  </div>

                  <div className="relative max-w-3xl mx-auto pl-6 border-l border-slate-800 space-y-8">
                    {[
                      { step: "01", title: "Validating Lead", desc: "Zod layers verify corporate domains, rejecting disposable accounts." },
                      { step: "02", title: "Web Crawler Research", desc: "HTTP layers gather site accessibility metadata and heading structures." },
                      { step: "03", title: "Consulting AI Synthesis", desc: "Generative LLM completes custom automation plans and strategic guidelines." },
                      { step: "04", title: "Server-side PDF Compiling", desc: "Document layers assemble and serialize high-fidelity McKinsey-style PDFs." },
                      { step: "05", title: "Branded Resend Dispatch", desc: "Email layers deliver a personalized notification along with the PDF report." },
                      { step: "06", title: "Google Cloud Synchronizer", desc: "Saves record variables in Sheets Tracker and uploads PDFs to Drive folders." }
                    ].map((timeline, idx) => (
                      <div key={idx} className="relative group">
                        <div className="absolute -left-[35px] top-0.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-blue-500 group-hover:bg-blue-500 transition-colors duration-300" />
                        <div>
                          <span className="text-[10px] text-blue-400 font-mono font-bold tracking-widest block uppercase">
                            Step {timeline.step}
                          </span>
                          <h4 className="text-xs font-bold text-white mt-0.5">{timeline.title}</h4>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{timeline.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ADMIN MONITORING DASHBOARD PANEL */}
          {activeTab === "admin" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass rounded-3xl p-6 md:p-8 w-full border border-slate-800 shadow-2xl"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <History className="w-5 h-5 text-blue-400" />
                    <span>Real-Time Lead Intake Dashboard</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Verify database records, enriched metadata, and full execution trace logs.
                  </p>
                </div>
                <button
                  onClick={loadPastLeads}
                  className="mt-4 md:mt-0 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-850 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Loader2 className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
                  <span>Refresh DB Entries</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* PAST LEADS LIST */}
                <div className="lg:col-span-5 border-r border-slate-800 pr-0 lg:pr-8 max-h-[480px] overflow-y-auto space-y-3 scrollbar">
                  <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                    Captured Lead Entries ({pastLeads.length})
                  </h4>

                  {pastLeads.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs bg-slate-900/20 rounded-2xl border border-dashed border-slate-850">
                      No lead records found in the database.
                    </div>
                  ) : (
                    pastLeads.map((lead) => (
                      <button
                        key={lead.id}
                        onClick={() => setSelectedLeadDetail(lead)}
                        className={`w-full text-left p-3.5 rounded-xl border transition duration-200 block cursor-pointer ${
                          selectedLeadDetail?.id === lead.id
                            ? "bg-blue-950/20 border-blue-500/35 glow-primary"
                            : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{lead.companyName}</span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                            {lead.fullName}
                          </span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-850 border border-slate-800 text-emerald-400 font-mono font-bold">
                            {lead.reports?.[0]?.emailStatus || "SUCCESS"}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* DETAILED LEAD WORKFLOW AUDIT LOG */}
                <div className="lg:col-span-7 flex flex-col justify-between max-h-[480px] overflow-y-auto scrollbar">
                  {selectedLeadDetail ? (
                    <div className="space-y-6">
                      <div className="border-b border-slate-800 pb-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                            <Building className="w-4 h-4 text-blue-400" />
                            <span>Lead Profiler & Telemetry Trace</span>
                          </h3>
                          {selectedLeadDetail.reports?.[0]?.pdfPath && (
                            <a
                              href={selectedLeadDetail.reports[0].pdfPath}
                              download
                              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold flex items-center space-x-1 transition cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              <span>Get PDF Report</span>
                            </a>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
                          <div>
                            <span className="text-slate-500">Name:</span>{" "}
                            <span className="text-white font-semibold">{selectedLeadDetail.fullName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Email:</span>{" "}
                            <span className="text-white font-semibold">{selectedLeadDetail.email}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Domain:</span>{" "}
                            <a
                              href={selectedLeadDetail.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:underline"
                            >
                              {selectedLeadDetail.website}
                            </a>
                          </div>
                          <div>
                            <span className="text-slate-500">Industry:</span>{" "}
                            <span className="text-white font-semibold">{selectedLeadDetail.industry || "Not Specified"}</span>
                          </div>
                        </div>
                      </div>

                      {/* WORKFLOW LOG LIST */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                          Execution Trace Logs
                        </h4>

                        {selectedLeadDetail.logs && selectedLeadDetail.logs.length > 0 ? (
                          <div className="space-y-2.5 max-h-[260px] overflow-y-auto scrollbar">
                            {selectedLeadDetail.logs.map((log: any) => (
                              <div
                                key={log.id}
                                className="flex items-start space-x-2.5 text-[11px] p-2.5 rounded bg-slate-900/60 border border-slate-800"
                              >
                                {log.status === "SUCCESS" ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                )}
                                <div>
                                  <span className="font-bold text-slate-300 block font-mono text-[9px] uppercase tracking-widest text-blue-400">{log.step}</span>
                                  <span className="text-slate-400">{log.message}</span>
                                  {log.error && (
                                    <span className="text-[10px] text-rose-400 font-mono block mt-1">
                                      Error: {log.error}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500 bg-slate-900/30 p-4 rounded text-center border border-dashed border-slate-800">
                            No telemetry logs logged for this lead.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-slate-500 border border-dashed border-slate-800 rounded-3xl bg-slate-900/10">
                      <Info className="w-8 h-8 mb-3 text-slate-600" />
                      <p className="text-xs">Select a captured lead from the telemetry list to view audits.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="glass border-t border-slate-800/85 px-6 md:px-12 py-5 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 mt-12">
        <p>&copy; {new Date().getFullYear()} InsightPilot AI Solutions. All rights reserved.</p>
        <div className="flex items-center space-x-4 mt-2 md:mt-0">
          <span>Enterprise Grade Lead Enrichment Hub</span>
          <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
          <span>McKinsey Standard Generation</span>
        </div>
      </footer>
    </div>
  );
}
