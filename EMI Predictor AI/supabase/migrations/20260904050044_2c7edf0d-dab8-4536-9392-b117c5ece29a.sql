CREATE TABLE public.applicant_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL DEFAULT 'Male',
  marital_status TEXT NOT NULL DEFAULT 'Single',
  education TEXT NOT NULL DEFAULT 'Graduate',
  employment_type TEXT NOT NULL DEFAULT 'Private',
  years_of_employment NUMERIC NOT NULL DEFAULT 0,
  monthly_salary NUMERIC NOT NULL DEFAULT 0,
  monthly_rent NUMERIC NOT NULL DEFAULT 0,
  dependents INTEGER NOT NULL DEFAULT 0,
  monthly_expenses NUMERIC NOT NULL DEFAULT 0,
  existing_loans BOOLEAN NOT NULL DEFAULT false,
  current_emi NUMERIC NOT NULL DEFAULT 0,
  credit_score INTEGER NOT NULL DEFAULT 700,
  bank_balance NUMERIC NOT NULL DEFAULT 0,
  emi_scenario TEXT NOT NULL DEFAULT 'Personal Loan',
  emi_eligible BOOLEAN NOT NULL DEFAULT false,
  risk_score NUMERIC NOT NULL DEFAULT 0,
  max_monthly_emi NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.applicant_records TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applicant_records TO authenticated;
GRANT ALL ON public.applicant_records TO service_role;

ALTER TABLE public.applicant_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Demo open read" ON public.applicant_records FOR SELECT USING (true);
CREATE POLICY "Demo open insert" ON public.applicant_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Demo open update" ON public.applicant_records FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Demo open delete" ON public.applicant_records FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_applicant_records_updated_at
BEFORE UPDATE ON public.applicant_records
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.applicant_records
(full_name, age, gender, marital_status, education, employment_type, years_of_employment, monthly_salary, monthly_rent, dependents, monthly_expenses, existing_loans, current_emi, credit_score, bank_balance, emi_scenario, emi_eligible, risk_score, max_monthly_emi) VALUES
('Ananya Sharma', 32, 'Female', 'Married', 'Professional', 'Private', 7.5, 118000, 22000, 1, 26000, false, 0, 781, 640000, 'Home Loan', true, 18.4, 41200),
('Rohit Verma', 41, 'Male', 'Married', 'Graduate', 'Government', 14.0, 92000, 0, 2, 31000, true, 12000, 742, 410000, 'Car Loan', true, 27.6, 24800),
('Meera Iyer', 29, 'Female', 'Single', 'Post Graduate', 'Private', 4.2, 76000, 18000, 0, 21000, false, 0, 715, 180000, 'Personal Loan', true, 31.2, 19600),
('Sandeep Rao', 47, 'Male', 'Married', 'High School', 'Self Employed', 11.0, 54000, 9000, 3, 29000, true, 9500, 638, 72000, 'Personal Loan', false, 68.9, 4300),
('Priya Nair', 35, 'Female', 'Married', 'Professional', 'Private', 9.1, 143000, 35000, 2, 38000, true, 21000, 799, 910000, 'Home Loan', true, 21.7, 46500),
('Arjun Mehta', 26, 'Male', 'Single', 'Graduate', 'Private', 1.4, 38000, 14000, 0, 16000, false, 0, 664, 46000, 'Consumer Durable', true, 44.8, 6900),
('Kavya Reddy', 38, 'Female', 'Divorced', 'Post Graduate', 'Government', 12.6, 87000, 0, 1, 24000, false, 0, 768, 355000, 'Education Loan', true, 22.9, 28400),
('Imran Sheikh', 52, 'Male', 'Married', 'High School', 'Self Employed', 20.0, 47000, 11000, 4, 32000, true, 14000, 592, 28000, 'Personal Loan', false, 82.3, 0),
('Neha Gupta', 31, 'Female', 'Single', 'Professional', 'Private', 6.0, 105000, 26000, 0, 23000, false, 0, 754, 470000, 'Car Loan', true, 20.1, 34700),
('Vikram Singh', 44, 'Male', 'Married', 'Graduate', 'Private', 16.2, 68000, 15000, 2, 27000, true, 11000, 689, 132000, 'Home Loan', false, 57.4, 8200),
('Deepa Menon', 28, 'Female', 'Single', 'Graduate', 'Private', 3.0, 42000, 12000, 0, 18000, false, 0, 701, 61000, 'Consumer Durable', true, 39.5, 8100),
('Rajesh Kumar', 56, 'Male', 'Married', 'Post Graduate', 'Government', 25.0, 99000, 0, 1, 28000, true, 8000, 812, 780000, 'Education Loan', true, 16.8, 37900);