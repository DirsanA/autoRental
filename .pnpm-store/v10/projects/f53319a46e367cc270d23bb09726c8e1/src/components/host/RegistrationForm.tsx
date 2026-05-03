import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Pencil,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepProgress } from "./StepProgress";
import { FileUpload } from "./FileUpload";
import {
  HostFormData,
  HostStep,
  ETHIOPIAN_REGIONS,
  SUPPORTED_CITIES,
  FLEET_SIZES,
  stepSchemas,
} from "./types";
import { createCompany } from "@/lib/companyApi";
import { useToast } from "@/hooks/use-toast";

type FormProps = {
  step: HostStep;
  data: HostFormData;
  setData: (updater: (d: HostFormData) => HostFormData) => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  goToStep: (s: HostStep) => void;
};

type Errors = Partial<Record<keyof HostFormData, string>>;

const titles: Record<
  string,
  { eyebrow: string; title: string; subtitle: string }
> = {
  "form-location": {
    eyebrow: "Step 1 of 5",
    title: "Operating Location",
    subtitle: "Confirm your primary business base in Ethiopia.",
  },
  "form-company": {
    eyebrow: "Step 2 of 5",
    title: "Company Identity",
    subtitle: "Details of your legally registered business.",
  },
  "form-contact": {
    eyebrow: "Step 3 of 5",
    title: "Primary Contact",
    subtitle: "How should our partnership team reach you?",
  },
  "form-professional": {
    eyebrow: "Step 4 of 5",
    title: "Fleet & Documents",
    subtitle: "Provide your professional capacity and verification.",
  },
  "form-review": {
    eyebrow: "Step 5 of 5",
    title: "Final Review",
    subtitle: "Verify your information before submission.",
  },
};

const Field = ({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <Label className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
    </div>
    {children}
    {error ? (
      <div className="flex items-center gap-1.5 text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1">
        <AlertCircle className="h-3.5 w-3.5" />
        {error}
      </div>
    ) : (
      hint && (
        <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
          {hint}
        </p>
      )
    )}
  </div>
);

export const RegistrationForm = ({
  step,
  data,
  setData,
  onBack,
  onNext,
  onSubmit,
  goToStep,
}: FormProps) => {
  const meta = titles[step];
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await createCompany(data);

      toast({
        title: "Success",
        description: "Application submitted successfully!",
      });

      onSubmit(); // go to pending step
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.error?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const set = <K extends keyof HostFormData>(k: K, v: HostFormData[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((prev) => {
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  const validateAndContinue = () => {
    const schema = stepSchemas[step as keyof typeof stepSchemas];
    if (!schema) {
      onNext();
      return;
    }
    const result = schema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Errors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof HostFormData;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    onNext();
  };

  const reviewIssues = useMemo(() => {
    if (step !== "form-review") return [] as string[];
    const issues: string[] = [];
    (Object.keys(stepSchemas) as Array<keyof typeof stepSchemas>).forEach(
      (k) => {
        const r = stepSchemas[k].safeParse(data);
        if (!r.success) issues.push(titles[k].title);
      },
    );
    return issues;
  }, [step, data]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-12">
          <StepProgress current={step} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="text-center mb-8">
              <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase bg-primary/10 text-primary rounded-full mb-4">
                {meta.eyebrow}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                {meta.title}
              </h1>
              <p className="mt-3 text-muted-foreground text-base max-w-md mx-auto">
                {meta.subtitle}
              </p>
            </div>

            <div className="relative rounded-[2rem] border border-border/50 bg-card p-8 sm:p-10 shadow-xl shadow-foreground/5 overflow-hidden">
              {/* Subtle decorative gradient */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

              {step === "form-location" && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Region" required error={errors.region}>
                    <Select
                      value={data.region}
                      onValueChange={(v) => set("region", v)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {ETHIOPIAN_REGIONS.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="City" required error={errors.city}>
                    <Select
                      value={data.city}
                      onValueChange={(v) => set("city", v)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_CITIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <div className="sm:col-span-2">
                    <Field
                      label="Sub-city / Woreda"
                      hint="Detailed location helps us verify faster"
                    >
                      <Input
                        className="h-11"
                        value={data.subCity}
                        onChange={(e) => set("subCity", e.target.value)}
                        placeholder="e.g. Bole, Kirkos"
                        maxLength={60}
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field
                      label="Business Address"
                      required
                      error={errors.address}
                    >
                      <Input
                        className="h-11"
                        value={data.address}
                        onChange={(e) => set("address", e.target.value)}
                        placeholder="Street, building, P.O. Box"
                        maxLength={200}
                      />
                    </Field>
                  </div>
                </div>
              )}

              {step === "form-company" && (
                <div className="grid gap-6">
                  <Field
                    label="Legal Company Name"
                    required
                    error={errors.companyName}
                  >
                    <Input
                      className="h-11"
                      value={data.companyName}
                      onChange={(e) => set("companyName", e.target.value)}
                      placeholder="e.g. Habesha Mobility PLC"
                      maxLength={120}
                    />
                  </Field>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field
                      label="TIN Number"
                      required
                      error={errors.tin}
                      hint="10-digit number"
                    >
                      <Input
                        className="h-11"
                        inputMode="numeric"
                        value={data.tin}
                        onChange={(e) =>
                          set(
                            "tin",
                            e.target.value.replace(/\D/g, "").slice(0, 10),
                          )
                        }
                        placeholder="0012345678"
                      />
                    </Field>
                    <Field
                      label="Registration #"
                      required
                      error={errors.registrationNumber}
                    >
                      <Input
                        className="h-11"
                        value={data.registrationNumber}
                        onChange={(e) =>
                          set(
                            "registrationNumber",
                            e.target.value.toUpperCase().slice(0, 20),
                          )
                        }
                        placeholder="e.g. AA/12345/15"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {step === "form-contact" && (
                <div className="grid gap-6">
                  <Field label="Full Name" required error={errors.fullName}>
                    <Input
                      className="h-11"
                      value={data.fullName}
                      onChange={(e) => set("fullName", e.target.value)}
                      placeholder="Representative's name"
                      maxLength={80}
                    />
                  </Field>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field label="Email" required error={errors.email}>
                      <Input
                        className="h-11"
                        type="email"
                        value={data.email}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="you@company.et"
                      />
                    </Field>
                    <Field
                      label="Phone"
                      required
                      error={errors.phone}
                      hint="Include area code"
                    >
                      <Input
                        className="h-11"
                        type="tel"
                        value={data.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        placeholder="+251 9..."
                      />
                    </Field>
                  </div>
                </div>
              )}

              {step === "form-professional" && (
                <div className="grid gap-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field label="Fleet Size" required error={errors.fleetSize}>
                      <Select
                        value={data.fleetSize}
                        onValueChange={(v) => set("fleetSize", v)}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Quantity" />
                        </SelectTrigger>
                        <SelectContent>
                          {FLEET_SIZES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c} vehicles
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field
                      label="Experience"
                      error={errors.yearsInBusiness}
                      hint="Years in operation"
                    >
                      <Input
                        className="h-11"
                        inputMode="numeric"
                        value={data.yearsInBusiness}
                        onChange={(e) =>
                          set(
                            "yearsInBusiness",
                            e.target.value.replace(/\D/g, "").slice(0, 2),
                          )
                        }
                        placeholder="e.g. 5"
                      />
                    </Field>
                  </div>
                  <Field
                    label="Vehicle Types"
                    required
                    error={errors.vehicleTypes}
                  >
                    <Input
                      className="h-11"
                      value={data.vehicleTypes}
                      onChange={(e) => set("vehicleTypes", e.target.value)}
                      placeholder="e.g. SUVs, Sedans, Minibuses"
                    />
                  </Field>
                  <div className="space-y-4 pt-2">
                    <Field
                      label="Commercial License"
                      required
                      error={errors.licenseFile}
                    >
                      <FileUpload
                        value={data.licenseFile}
                        onChange={(f) => set("licenseFile", f)}
                      />
                    </Field>
                    <Field
                      label="TIN Certificate"
                      required
                      error={errors.tinCertFile}
                    >
                      <FileUpload
                        value={data.tinCertFile}
                        onChange={(f) => set("tinCertFile", f)}
                      />
                    </Field>
                  </div>
                </div>
              )}

              {step === "form-review" && (
                <div className="space-y-6">
                  {reviewIssues.length > 0 && (
                    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-sm text-destructive">
                          Required Information Missing
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Please review: {reviewIssues.join(", ")}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4">
                    {[
                      {
                        title: "Location",
                        step: "form-location" as const,
                        items: [
                          ["Region", data.region],
                          ["City", data.city],
                          ["Address", data.address],
                        ],
                      },
                      {
                        title: "Company",
                        step: "form-company" as const,
                        items: [
                          ["Legal Name", data.companyName],
                          ["TIN", data.tin],
                        ],
                      },
                      {
                        title: "Contact",
                        step: "form-contact" as const,
                        items: [
                          ["Name", data.fullName],
                          ["Phone", data.phone],
                        ],
                      },
                    ].map((section) => (
                      <div
                        key={section.title}
                        className="group relative rounded-2xl border border-border/50 bg-background/50 p-4 transition-colors hover:border-primary/30"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {section.title}
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => goToStep(section.step)}
                            className="h-7 text-primary hover:text-primary hover:bg-primary/5 px-2"
                          >
                            <Pencil className="mr-1 h-3 w-3" /> Edit
                          </Button>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {section.items.map(([k, v]) => (
                            <div key={k} className="text-sm">
                              <span className="text-muted-foreground mr-2">
                                {k}:
                              </span>
                              <span className="font-semibold text-foreground truncate">
                                {v || "—"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-muted-foreground text-center px-4">
                    By submitting, you confirm that the information provided
                    matches your official government documents.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-10 flex items-center justify-between gap-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="rounded-full px-6"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>

              {step === "form-review" ? (
                <Button
                  size="lg"
                  disabled={reviewIssues.length > 0 || loading}
                  onClick={handleSubmit}
                  className="rounded-full px-10 shadow-lg shadow-primary/20"
                >
                  {loading ? "Submitting..." : "Confirm & Submit Application"}
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={validateAndContinue}
                  className="rounded-full px-10 shadow-lg shadow-primary/20"
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
