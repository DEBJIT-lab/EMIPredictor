import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import {
  CREDIT_BANDS,
  DATASET_PROFILE,
  FEATURE_IMPORTANCE,
  SALARY_BANDS,
  SCENARIO_DISTRIBUTION,
} from "@/lib/mlflow-runs";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Data Explorer — 400k Loan Records | EMI Risk Intelligence" },
      {
        name: "description",
        content:
          "Explore approval rates by EMI scenario, salary band and credit band across the 400,000-record training corpus.",
      },
      { property: "og:title", content: "EMI Data Explorer" },
      {
        property: "og:description",
        content: "Approval rates, risk factors and feature importance across 400,000 loan records.",
      },
    ],
  }),
  component: ExplorePage,
});

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  color: "var(--popover-foreground)",
  fontSize: "12px",
};

function ExplorePage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <h1 className="text-3xl font-semibold">Data explorer</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Exploratory analysis of the training corpus: eligibility distribution across five lending
        scenarios, income and credit relationships, and the drivers the model leans on.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Raw records" value="400,000" sub="5 EMI scenarios" />
        <StatCard
          label="After cleaning"
          value={DATASET_PROFILE.cleanedRecords.toLocaleString()}
          sub="deduplicated & imputed"
        />
        <StatCard
          label="Overall approval rate"
          value={`${(DATASET_PROFILE.eligibleShare * 100).toFixed(1)}%`}
          sub="eligible applicants"
        />
        <StatCard
          label="Mean monthly salary"
          value={`₹${DATASET_PROFILE.meanSalary.toLocaleString("en-IN")}`}
          sub={`mean age ${DATASET_PROFILE.meanAge}`}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="surface-panel">
          <CardHeader>
            <CardTitle className="text-base">Approval rate by EMI scenario</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SCENARIO_DISTRIBUTION}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="scenario"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => `${(v * 100).toFixed(1)}%`}
                />
                <Bar dataKey="approvalRate" radius={[6, 6, 0, 0]} fill="var(--chart-1)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="surface-panel">
          <CardHeader>
            <CardTitle className="text-base">Applicants & approval by salary band</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SALARY_BANDS}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="band" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="applicants" radius={[6, 6, 0, 0]} fill="var(--chart-2)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="surface-panel">
          <CardHeader>
            <CardTitle className="text-base">Credit band: approval vs default</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CREDIT_BANDS}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="band" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis
                  tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => `${(v * 100).toFixed(1)}%`}
                />
                <Line
                  type="monotone"
                  dataKey="approvalRate"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="defaultRate"
                  stroke="var(--chart-5)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="surface-panel">
          <CardHeader>
            <CardTitle className="text-base">Feature importance (XGBoost gain)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FEATURE_IMPORTANCE} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  type="number"
                  tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  type="category"
                  dataKey="feature"
                  width={130}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => `${(v * 100).toFixed(1)}%`}
                />
                <Bar dataKey="importance" radius={[0, 6, 6, 0]}>
                  {FEATURE_IMPORTANCE.map((_, i) => (
                    <Cell key={i} fill={i < 3 ? "var(--chart-1)" : "var(--chart-2)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="surface-panel mt-8">
        <CardHeader>
          <CardTitle className="text-base">Business insights</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-muted-foreground md:grid-cols-3">
          <p>
            Credit score alone explains roughly 27% of model gain — applicants below 670 are
            approved less than one time in eight.
          </p>
          <p>
            Approval rate rises from 7% under ₹25k monthly income to 63% above ₹100k, but
            affordability ratio separates borderline cases better than raw salary.
          </p>
          <p>
            Education loans show the highest approval rate (34%) and consumer durables the tightest
            EMI ceilings, driven by a 35% FOIR cap.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
