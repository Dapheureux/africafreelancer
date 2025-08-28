-- Create payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status payment_status DEFAULT 'pending',
  escrow_date TIMESTAMP WITH TIME ZONE,
  release_date TIMESTAMP WITH TIME ZONE,
  refund_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table for payment history
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('escrow', 'release', 'refund')) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_payments_contract_id ON payments(contract_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_transactions_payment_id ON transactions(payment_id);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "Users can view payments for their contracts" ON payments
  FOR SELECT USING (
    contract_id IN (
      SELECT id FROM contracts 
      WHERE client_id = auth.uid() OR freelancer_id = auth.uid()
    )
  );

CREATE POLICY "Clients can create payments for their contracts" ON payments
  FOR INSERT WITH CHECK (
    contract_id IN (
      SELECT id FROM contracts WHERE client_id = auth.uid()
    )
  );

CREATE POLICY "Users can update payments for their contracts" ON payments
  FOR UPDATE USING (
    contract_id IN (
      SELECT id FROM contracts 
      WHERE client_id = auth.uid() OR freelancer_id = auth.uid()
    )
  );

-- RLS Policies for transactions
CREATE POLICY "Users can view transactions for their payments" ON transactions
  FOR SELECT USING (
    payment_id IN (
      SELECT p.id FROM payments p
      JOIN contracts c ON p.contract_id = c.id
      WHERE c.client_id = auth.uid() OR c.freelancer_id = auth.uid()
    )
  );

CREATE POLICY "System can insert transactions" ON transactions
  FOR INSERT WITH CHECK (true);
