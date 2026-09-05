import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Database,
  Gauge,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { CLASSIFICATION_RUNS, DATASET_PROFILE, REGRESSION_RUNS } from "@/lib/mlflow-runs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EMI Risk Intelligence — ML Loan Affordability Platform" },
      {
        name: "description",
        content:
          "Assess EMI eligibility and maximum affordable EMI in seconds with XGBoost models trained on 400,000 financial records and tracked in MLflow.",
      },
      { property: "og:title", content: "EMI Risk Intelligence Platform" },
      {
        property: "og:description",
        content:
          "Dual ML engine for EMI eligibility classification and maximum EMI regression, with MLflow experiment tracking.",
      },
    ],
  }),
  component: Home,
});

const bestCls = CLASSIFICATION_RUNS[2];
const bestReg = REGRESSION_RUNS[2];

const USE_CASES = [
  {
    icon: ShieldCheck,
    title: "Financial institutions",
    points: [
      "Automate approvals and cut manual underwriting time",
      "Risk-based pricing across five EMI scenarios",
      "Instant eligibility for walk-in customers",
    ],
  },
  {
    icon: Sparkles,
    title: "FinTech platforms",
    points: [
      "Instant pre-qualification for digital lending",
      "Automated risk scoring on every application",
      "Responsive UI ready for mobile embedding",
    ],
  },
  {
    icon: TrendingUp,
    title: "Banks & credit agencies",
    points: [
      "Data-driven EMI ceiling recommendations",
      "Portfolio risk and default concentration views",
      "Documented, auditable decision trail",
    ],
  },
  {
    icon: Gauge,
    title: "Loan officers",
    points: [
      "Full financial profile analysed in seconds",
      "Ranked risk drivers behind every decision",
      "Model accuracy monitoring in one dashboard",
    ],
  },
];

function Home() {
  return (
    <main>
      <section className="hero-gradient border-b border-border/60">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Activity className="size-3.5" /> Dual ML engine · classification + regression
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">
              Know if an EMI is <span className="text-gradient">affordable</span> before the loan is
              signed.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground">
              A financial risk assessment platform that turns 22 demographic and financial variables
              into an eligibility decision and a maximum monthly EMI ceiling — powered by XGBoost
              models trained on 400,000 records and versioned in MLflow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/assess">Run an assessment</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/models">View model registry</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Eligibility ROC-AUC"
              value={bestCls.rocAuc.toFixed(4)}
              sub={bestCls.model}
              icon={<ShieldCheck className="size-5" />}
            />
            <StatCard
              label="EMI amount R²"
              value={bestReg.r2.toFixed(4)}
              sub={bestReg.model}
              icon={<TrendingUp className="size-5" />}
            />
            <StatCard
              label="Training records"
              value="400,000"
              sub={`${DATASET_PROFILE.cleanedRecords.toLocaleString()} after cleaning`}
              icon={<Database className="size-5" />}
            />
            <StatCard
              label="Engineered features"
              value={`${DATASET_PROFILE.encodedFeatures}`}
              sub={`from ${DATASET_PROFILE.features} raw variables`}
              icon={<BarChart3 className="size-5" />}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <h2 className="text-2xl font-semibold">Built for the whole lending chain</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          The same scoring engine serves underwriting desks, digital lenders and portfolio risk
          teams.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {USE_CASES.map((uc) => (
            <Card key={uc.title} className="surface-panel h-full">
              <CardHeader className="pb-2">
                <uc.icon className="size-6 text-primary" />
                <CardTitle className="mt-3 text-base">{uc.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {uc.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      {p}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20">
        <Card className="surface-panel">
          <CardContent className="grid gap-8 p-8 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold">1 · Engineer</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Debt-to-income, expense-to-income, affordability, savings runway, employment
                stability and credit strength are derived from the raw applicant profile.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">2 · Score</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                The classifier returns an eligibility probability and risk band; the regressor
                returns the maximum monthly EMI, capped by scenario-specific FOIR limits.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">3 · Govern</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Every candidate model is logged to MLflow with parameters and metrics; the winners
                are promoted to the registry and served here.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
