import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { EMI_SCENARIOS, assessApplicant, formatCurrency } from "@/lib/emi-model";
import { StatCard } from "@/components/StatCard";

export const Route = createFileRoute("/records")({
  head: () => ({
    meta: [
      { title: "Applicant Records Console | EMI Risk Intelligence" },
      {
        name: "description",
        content:
          "Create, review, update and delete applicant financial records with automatic re-scoring of eligibility and maximum EMI.",
      },
      { property: "og:title", content: "Applicant Records Console" },
      {
        property: "og:description",
        content: "Full data management for applicant financial profiles with live re-scoring.",
      },
    ],
  }),
  component: RecordsPage,
});

interface RecordRow {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  marital_status: string;
  education: string;
  employment_type: string;
  years_of_employment: number;
  monthly_salary: number;
  monthly_rent: number;
  dependents: number;
  monthly_expenses: number;
  existing_loans: boolean;
  current_emi: number;
  credit_score: number;
  bank_balance: number;
  emi_scenario: string;
  emi_eligible: boolean;
  risk_score: number;
  max_monthly_emi: number;
}

const BLANK = {
  full_name: "",
  age: 32,
  gender: "Male",
  marital_status: "Single",
  education: "Graduate",
  employment_type: "Private",
  years_of_employment: 3,
  monthly_salary: 60000,
  monthly_rent: 12000,
  dependents: 0,
  monthly_expenses: 20000,
  existing_loans: false,
  current_emi: 0,
  credit_score: 720,
  bank_balance: 100000,
  emi_scenario: "Personal Loan",
};

type Draft = typeof BLANK;

function rescore(d: Draft) {
  const r = assessApplicant({
    age: d.age,
    gender: d.gender,
    maritalStatus: d.marital_status,
    education: d.education,
    employmentType: d.employment_type,
    yearsOfEmployment: d.years_of_employment,
    monthlySalary: d.monthly_salary,
    monthlyRent: d.monthly_rent,
    dependents: d.dependents,
    monthlyExpenses: d.monthly_expenses,
    existingLoans: d.existing_loans,
    currentEmi: d.current_emi,
    creditScore: d.credit_score,
    bankBalance: d.bank_balance,
    emiScenario: d.emi_scenario,
  });
  return { emi_eligible: r.eligible, risk_score: r.riskScore, max_monthly_emi: r.maxMonthlyEmi };
}

function RecordsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(BLANK);
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["applicant_records"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applicant_records")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as RecordRow[];
    },
  });

  const rows = data ?? [];
  const filtered = useMemo(
    () =>
      rows.filter((r) =>
        `${r.full_name} ${r.emi_scenario}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [rows, search],
  );

  const stats = useMemo(() => {
    if (!rows.length) return { total: 0, approval: 0, avgEmi: 0, avgRisk: 0 };
    const eligible = rows.filter((r) => r.emi_eligible).length;
    return {
      total: rows.length,
      approval: eligible / rows.length,
      avgEmi: rows.reduce((s, r) => s + Number(r.max_monthly_emi), 0) / rows.length,
      avgRisk: rows.reduce((s, r) => s + Number(r.risk_score), 0) / rows.length,
    };
  }, [rows]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...draft, ...rescore(draft) };
      if (editingId) {
        const { error } = await supabase
          .from("applicant_records")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("applicant_records").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingId ? "Record updated" : "Record created");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["applicant_records"] });
    },
    onError: () => toast.error("Could not save that record"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("applicant_records").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Record deleted");
      qc.invalidateQueries({ queryKey: ["applicant_records"] });
    },
    onError: () => toast.error("Could not delete that record"),
  });

  const openNew = () => {
    setEditingId(null);
    setDraft(BLANK);
    setOpen(true);
  };

  const openEdit = (r: RecordRow) => {
    setEditingId(r.id);
    setDraft({
      full_name: r.full_name,
      age: Number(r.age),
      gender: r.gender,
      marital_status: r.marital_status,
      education: r.education,
      employment_type: r.employment_type,
      years_of_employment: Number(r.years_of_employment),
      monthly_salary: Number(r.monthly_salary),
      monthly_rent: Number(r.monthly_rent),
      dependents: Number(r.dependents),
      monthly_expenses: Number(r.monthly_expenses),
      existing_loans: r.existing_loans,
      current_emi: Number(r.current_emi),
      credit_score: Number(r.credit_score),
      bank_balance: Number(r.bank_balance),
      emi_scenario: r.emi_scenario,
    });
    setOpen(true);
  };

  const numField = (key: keyof Draft, label: string) => (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        value={draft[key] as number}
        onChange={(e) => setDraft({ ...draft, [key]: Number(e.target.value) || 0 })}
      />
    </div>
  );

  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Applicant records</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Administrative console for financial data management. Every create and update re-scores
            eligibility, risk and the maximum EMI automatically.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={openNew}>
            <Plus className="size-4" /> New record
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Records" value={`${stats.total}`} />
        <StatCard label="Approval rate" value={`${(stats.approval * 100).toFixed(0)}%`} />
        <StatCard label="Avg max EMI" value={formatCurrency(stats.avgEmi)} />
        <StatCard label="Avg risk score" value={stats.avgRisk.toFixed(1)} sub="0 = safest" />
      </div>

      <Card className="surface-panel mt-8">
        <CardContent className="p-5">
          <Input
            className="max-w-sm"
            placeholder="Search by name or scenario"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Scenario</TableHead>
                  <TableHead className="text-right">Salary</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Risk</TableHead>
                  <TableHead>Decision</TableHead>
                  <TableHead className="text-right">Max EMI</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                      Loading records…
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                      No records match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium">{r.full_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.age} · {r.employment_type} · {r.education}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{r.emi_scenario}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(r.monthly_salary))}
                      </TableCell>
                      <TableCell className="text-right">{r.credit_score}</TableCell>
                      <TableCell className="text-right">{Number(r.risk_score).toFixed(1)}</TableCell>
                      <TableCell>
                        <Badge variant={r.emi_eligible ? "default" : "destructive"}>
                          {r.emi_eligible ? "Eligible" : "Declined"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(r.max_monthly_emi))}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(r)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => remove.mutate(r.id)}
                            disabled={remove.isPending}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit record" : "New record"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Full name</Label>
              <Input
                value={draft.full_name}
                onChange={(e) => setDraft({ ...draft, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">EMI scenario</Label>
              <Select
                value={draft.emi_scenario}
                onValueChange={(v) => setDraft({ ...draft, emi_scenario: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMI_SCENARIOS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {numField("age", "Age")}
            {numField("years_of_employment", "Years of employment")}
            {numField("monthly_salary", "Monthly salary (₹)")}
            {numField("monthly_rent", "Monthly rent (₹)")}
            {numField("monthly_expenses", "Monthly expenses (₹)")}
            {numField("current_emi", "Current EMI (₹)")}
            {numField("credit_score", "Credit score")}
            {numField("bank_balance", "Bank balance (₹)")}
            {numField("dependents", "Dependents")}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {editingId ? "Save changes" : "Create record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
