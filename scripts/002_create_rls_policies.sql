-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Anyone can view open projects" ON public.projects FOR SELECT USING (status = 'open' OR client_id = auth.uid());
CREATE POLICY "Clients can create projects" ON public.projects FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "Clients can update own projects" ON public.projects FOR UPDATE USING (client_id = auth.uid());
CREATE POLICY "Clients can delete own projects" ON public.projects FOR DELETE USING (client_id = auth.uid());

-- Proposals policies
CREATE POLICY "Project owners and proposal authors can view proposals" ON public.proposals FOR SELECT USING (
  freelancer_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND client_id = auth.uid())
);
CREATE POLICY "Freelancers can create proposals" ON public.proposals FOR INSERT WITH CHECK (freelancer_id = auth.uid());
CREATE POLICY "Freelancers can update own proposals" ON public.proposals FOR UPDATE USING (freelancer_id = auth.uid());

-- Contracts policies
CREATE POLICY "Contract parties can view contracts" ON public.contracts FOR SELECT USING (
  client_id = auth.uid() OR freelancer_id = auth.uid()
);
CREATE POLICY "Clients can create contracts" ON public.contracts FOR INSERT WITH CHECK (client_id = auth.uid());

-- Payments policies
CREATE POLICY "Contract parties can view payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.contracts WHERE id = contract_id AND (client_id = auth.uid() OR freelancer_id = auth.uid()))
);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Contract parties can create reviews" ON public.reviews FOR INSERT WITH CHECK (
  reviewer_id = auth.uid() AND
  EXISTS (SELECT 1 FROM public.contracts WHERE id = contract_id AND (client_id = auth.uid() OR freelancer_id = auth.uid()))
);

-- Messages policies
CREATE POLICY "Contract parties can view messages" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.contracts WHERE id = contract_id AND (client_id = auth.uid() OR freelancer_id = auth.uid()))
);
CREATE POLICY "Contract parties can send messages" ON public.messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (SELECT 1 FROM public.contracts WHERE id = contract_id AND (client_id = auth.uid() OR freelancer_id = auth.uid()))
);
