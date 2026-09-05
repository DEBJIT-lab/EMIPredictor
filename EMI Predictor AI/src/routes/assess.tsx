import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Save, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EDUCATION,
  EMI_SCENARIOS,
  EMPLOYMENT_TYPES,
  GENDERS,
  MARITAL_STATUS,
  assessApplicant,
  formatCurrency,
  type ApplicantInput,
} from "@/lib/emi-model";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/assess")({
  head: () => ({
    meta: [
      { title: "Real-Time EMI Risk Assessment | EMI Risk Intelligence" },
      {
        name: "description",
        content:
          "Enter an applicant profile and get instant EMI eligibility, risk band and the maximum affordable monthly EMI.",
      },
      { property: "og:title", content: "Real-Time EMI Risk Assessment" },
      {
        property: "og:description",
        content: "Instant EMI eligibility and affordability scoring from 22 financial variables.",
      },
    ],
  }),
  component: AssessPage,
});

const DEFAULTS: ApplicantInput & { fullName: string } = {
  fullName: "",
  age: 34,
  gender: "Male",
  maritalStatus: "Married",
  education: "Graduate",
  employmentType: "Private",
  yearsOfEmployment: 5,
  monthlySalary: 85000,
  monthlyRent: 18000,
  dependents: 1,
  monthlyExpenses: 24000,
  existingLoans: false,
  currentEmi: 0,
  creditScore: 740,
  bankBalance: 250000,
  emiScenario: "Personal Loan",
};

function AssessPage() {
  const [form, setForm] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const result = assessApplicant(form);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const num = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: Number(e.target.value) || 0 }));

  const saveRecord = async () => {
    setSaving(true);
    const { error } = await supabase.from("applicant_records").insert({
      full_name: form.fullName.trim() || "Unnamed applicant",
      age: form.age,
      gender: form.gender,
      marital_status: form.maritalStatus,
      education: form.education,
      employment_type: form.employmentType,
      years_of_employment: form.yearsOfEmployment,
      monthly_salary: form.monthlySalary,
      monthly_rent: form.monthlyRent,
      dependents: form.dependents,
      monthly_expenses: form.monthlyExpenses,
      existing_loans: form.existingLoans,
      current_emi: form.currentEmi,
      credit_score: form.creditScore,
      bank_balance: form.bankBalance,
      emi_scenario: form.emiScenario,
      emi_eligible: result.eligible,
      risk_score: result.riskScore,
      max_monthly_emi: result.maxMonthlyEmi,
    });
    setSaving(false);
    if (error) toast.error("Could not save this assessment");
    else toast.success("Assessment saved to records");
  };

  const bandTone =
    result.riskBand === "Low"
      ? "text-success"
      : result.riskBand === "Moderate"
        ? "text-primary"
        : result.riskBand === "Elevated"
          ? "text-warning"
          : "text-destructive";

  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <h1 className="text-3xl font-semibold">Real-time risk assessment</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Scores update live as you type. The eligibility decision comes from the registered XGBoost
        classifier and the EMI ceiling from the XGBoost regressor, capped by scenario FOIR limits.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card className="surface-panel">
          <CardHeader>
            <CardTitle className="text-base">Applicant profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input
                value={form.fullName}
                placeholder="Optional"
                onChange={(e) => set("fullName", e.target.value)}
              />
            </Field>
            <Field label="EMI scenario">
              <Picker
                value={form.emiScenario as string}
                options={EMI_SCENARIOS}
                onChange={(v) => set("emiScenario", v)}
              />
            </Field>
            <Field label="Age">
              <Input type="number" value={form.age} onChange={num("age")} />
            </Field>
            <Field label="Gender">
              <Picker value={form.gender} options={[...GENDERS]} onChange={(v) => set("gender", v)} />
            </Field>
            <Field label="Marital status">
              <Picker
                value={form.maritalStatus}
                options={[...MARITAL_STATUS]}
                onChange={(v) => set("maritalStatus", v)}
              />
            </Field>
            <Field label="Education">
              <Picker
                value={form.education}
                options={[...EDUCATION]}
                onChange={(v) => set("education", v)}
              />
            </Field>
            <Field label="Employment type">
              <Picker
                value={form.employmentType}
                options={[...EMPLOYMENT_TYPES]}
                onChange={(v) => set("employmentType", v)}
              />
            </Field>
            <Field label="Years of employment">
              <Input
                type="number"
                step="0.1"
                value={form.yearsOfEmployment}
                onChange={num("yearsOfEmployment")}
              />
            </Field>
            <Field label="Monthly salary (₹)">
              <Input type="number" value={form.monthlySalary} onChange={num("monthlySalary")} />
            </Field>
            <Field label="Monthly rent (₹)">
              <Input type="number" value={form.monthlyRent} onChange={num("monthlyRent")} />
            </Field>
            <Field label="Other monthly expenses (₹)">
              <Input type="number" value={form.monthlyExpenses} onChange={num("monthlyExpenses")} />
            </Field>
            <Field label="Dependents">
              <Input type="number" value={form.dependents} onChange={num("dependents")} />
            </Field>
            <Field label="Credit score">
              <Input type="number" value={form.creditScore} onChange={num("creditScore")} />
            </Field>
            <Field label="Bank balance (₹)">
              <Input type="number" value={form.bankBalance} onChange={num("bankBalance")} />
            </Field>
            <Field label="Current EMI outgo (₹)">
              <Input type="number" value={form.currentEmi} onChange={num("currentEmi")} />
            </Field>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <Label htmlFor="loans" className="text-sm">
                Has existing loans
              </Label>
              <Switch
                id="loans"
                checked={form.existingLoans}
                onCheckedChange={(v) => set("existingLoans", v)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="surface-panel">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                {result.eligible ? (
                  <ShieldCheck className="size-7 text-success" />
                ) : (
                  <ShieldAlert className="size-7 text-destructive" />
                )}
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Eligibility decision
                  </p>
                  <p className="font-display text-xl font-semibold">
                    {result.eligible ? "Eligible" : "Not eligible"}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Approval probability</span>
                  <span className="font-medium">
                    {(result.eligibilityProbability * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={result.eligibilityProbability * 100} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Risk score
                  </p>
                  <p className={`font-display text-2xl font-semibold ${bandTone}`}>
                    {result.riskScore}
                    <span className="text-sm font-normal text-muted-foreground"> /100</span>
                  </p>
                  <p className={`text-xs ${bandTone}`}>{result.riskBand} risk</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Max monthly EMI
                  </p>
                  <p className="font-display text-2xl font-semibold">
                    {formatCurrency(result.maxMonthlyEmi)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    FOIR cap {formatCurrency(result.foirCap)}
                  </p>
                </div>
              </div>

              <Button className="mt-6 w-full" onClick={saveRecord} disabled={saving}>
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save to records
              </Button>
            </CardContent>
          </Card>

          <Card className="surface-panel">
            <CardHeader>
              <CardTitle className="text-base">Engineered features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row
                k="Disposable income"
                v={formatCurrency(result.features.disposableIncome)}
              />
              <Row k="Debt-to-income" v={`${(result.features.debtToIncome * 100).toFixed(1)}%`} />
              <Row
                k="Expense-to-income"
                v={`${(result.features.expenseToIncome * 100).toFixed(1)}%`}
              />
              <Row
                k="Affordability ratio"
                v={`${(result.features.affordabilityRatio * 100).toFixed(1)}%`}
              />
              <Row
                k="Savings runway"
                v={`${result.features.savingsRunwayMonths.toFixed(1)} months`}
              />
              <Row
                k="Employment stability"
                v={`${(result.features.employmentStability * 100).toFixed(0)}%`}
              />
              <Row
                k="Credit strength"
                v={`${(result.features.creditStrength * 100).toFixed(0)}%`}
              />
            </CardContent>
          </Card>

          <Card className="surface-panel">
            <CardHeader>
              <CardTitle className="text-base">Top risk drivers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.drivers.slice(0, 4).map((d) => (
                <div key={d.label}>
                  <div className="flex justify-between text-sm">
                    <span>{d.label}</span>
                    <span className="text-muted-foreground">+{d.impact.toFixed(1)} risk</span>
                  </div>
                  <Progress className="mt-1.5" value={(d.impact / 34) * 100} />
                  <p className="mt-1 text-xs text-muted-foreground">{d.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Picker({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-border/60 pb-1.5">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
