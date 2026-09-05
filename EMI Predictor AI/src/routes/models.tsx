import { createFileRoute } from "@tanstack/react-router";
import { Award, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CLASSIFICATION_RUNS,
  REGISTERED_MODELS,
  REGRESSION_RUNS,
} from "@/lib/mlflow-runs";

export const Route = createFileRoute("/models")({
  head: () => ({
    meta: [
      { title: "MLflow Model Registry & Performance | EMI Risk Intelligence" },
      {
        name: "description",
        content:
          "Compare six MLflow-tracked models: logistic regression, random forest and XGBoost for EMI eligibility and maximum EMI amount.",
      },
      { property: "og:title", content: "MLflow Model Registry & Performance" },
      {
        property: "og:description",
        content: "Six tracked runs, two registered production models, full metric comparison.",
      },
    ],
  }),
  component: ModelsPage,
});

function ModelsPage() {
  const bestCls = CLASSIFICATION_RUNS.reduce((a, b) => (b.rocAuc > a.rocAuc ? b : a));
  const bestReg = REGRESSION_RUNS.reduce((a, b) => (b.r2 > a.r2 ? b : a));

  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <h1 className="text-3xl font-semibold">Model registry & performance</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Experiment <span className="font-medium text-foreground">EMI_Prediction_Project</span> — six
        runs logged to MLflow with parameters, metrics and model artifacts. The winners are promoted
        to the registry and served by this app.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {REGISTERED_MODELS.map((m) => (
          <Card key={m.name} className="surface-panel">
            <CardContent className="flex items-start gap-4 p-6">
              <Award className="size-6 shrink-0 text-primary" />
              <div>
                <p className="font-display text-sm font-semibold break-all">{m.name}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge>v{m.version}</Badge>
                  <Badge variant="secondary">{m.stage}</Badge>
                  <span className="text-xs text-muted-foreground">run {m.runId}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{m.metric}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="surface-panel mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GitBranch className="size-4 text-primary" /> Classification — EMI eligibility
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Accuracy</TableHead>
                <TableHead className="text-right">Precision</TableHead>
                <TableHead className="text-right">Recall</TableHead>
                <TableHead className="text-right">F1</TableHead>
                <TableHead className="text-right">ROC-AUC</TableHead>
                <TableHead>Parameters</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CLASSIFICATION_RUNS.map((r) => (
                <TableRow key={r.runId} className={r.runId === bestCls.runId ? "bg-primary/10" : ""}>
                  <TableCell className="font-medium">
                    {r.model}
                    {r.runId === bestCls.runId ? (
                      <Badge className="ml-2">best</Badge>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">{r.accuracy.toFixed(4)}</TableCell>
                  <TableCell className="text-right">{r.precision.toFixed(4)}</TableCell>
                  <TableCell className="text-right">{r.recall.toFixed(4)}</TableCell>
                  <TableCell className="text-right">{r.f1.toFixed(4)}</TableCell>
                  <TableCell className="text-right">{r.rocAuc.toFixed(4)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.params}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="surface-panel mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GitBranch className="size-4 text-primary" /> Regression — maximum monthly EMI
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">RMSE</TableHead>
                <TableHead className="text-right">MAE</TableHead>
                <TableHead className="text-right">R²</TableHead>
                <TableHead className="text-right">MAPE</TableHead>
                <TableHead>Parameters</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {REGRESSION_RUNS.map((r) => (
                <TableRow key={r.runId} className={r.runId === bestReg.runId ? "bg-primary/10" : ""}>
                  <TableCell className="font-medium">
                    {r.model}
                    {r.runId === bestReg.runId ? <Badge className="ml-2">best</Badge> : null}
                  </TableCell>
                  <TableCell className="text-right">{r.rmse.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{r.mae.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{r.r2.toFixed(4)}</TableCell>
                  <TableCell className="text-right">{(r.mape * 100).toFixed(1)}%</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.params}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
