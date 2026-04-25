import { motion } from "framer-motion";
import { Clock, Mail, FileSearch, ShieldCheck, CheckCircle2, MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

const STAGES = [
  { icon: CheckCircle2, label: "Application received", description: "Your data is safely in our system.", status: "complete" },
  { icon: FileSearch, label: "Document review", description: "Verifying TIN and commercial licenses.", status: "active" },
  { icon: ShieldCheck, label: "Final approval", description: "Finalizing your host account setup.", status: "pending" },
];

export const PendingApproval = ({ email, onRestart }: { email: string; onRestart: () => void }) => {
  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center px-4 py-7 overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-xl text-center">
        {/* Hero Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center mb-8 rotate-3"
        >
          <Clock className="h-10 w-10 text-primary animate-pulse" strokeWidth={1.5} />
        </motion.div>

        {/* Header Section */}
        <div className="space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Application Processing
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            We are reviewing your <br />
            <span className="text-primary italic">application.</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
            Our verification team is currently processing your documents. We typically respond within <span className="text-foreground font-semibold">24–48 hours.</span>
          </p>
        </div>

        {/* Progress List */}
        <div className="text-left rounded-[2.5rem] border border-border/50 bg-card/50 backdrop-blur-sm p-8 shadow-2xl shadow-foreground/5 mb-8">
          <div className="space-y-8">
            {STAGES.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.15 }}
                className="group flex items-start gap-5"
              >
                <div className={`mt-1 h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-500
                  ${s.status === 'complete' ? "bg-primary/10 text-primary" : ""}
                  ${s.status === 'active' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : ""}
                  ${s.status === 'pending' ? "bg-muted/50 text-muted-foreground/50 border border-dashed border-border" : ""}`}
                >
                  <s.icon className="h-5 w-5" strokeWidth={s.status === 'active' ? 2.5 : 1.5} />
                </div>
                
                <div className="flex-1 border-b border-border/50 pb-6 group-last:border-0 group-last:pb-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-bold tracking-tight ${s.status === 'pending' ? 'text-muted-foreground/60' : 'text-foreground'}`}>
                      {s.label}
                    </span>
                    {s.status === 'active' && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">
                        Current Stage
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Notification Status */}
        <div className="flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-border bg-background px-5 py-3 text-sm shadow-sm">
            <Mail className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Notification sent to:</span>
            <span className="font-bold text-foreground">{email || "your@email.com"}</span>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={onRestart}
                className="text-muted-foreground hover:text-foreground text-xs"
            >
              Need to change something? <span className="underline ml-1">Start over</span>
            </Button>
            <div className="hidden sm:block h-4 w-[1px] bg-border" />
            <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-primary text-xs"
            >
              <MessageCircleQuestion className="mr-2 h-3 w-3" /> Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};