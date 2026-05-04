import { supabase } from './supabaseClient';

// Dashboard Metrics Fetcher
export async function getDashboardMetrics() {
  try {
    // 1. Fetch Active IR Cases / ER Cases
    const { count: irCasesCount } = await supabase
      .from('ir_cases')
      .select('*', { count: 'exact', head: true })
      .ilike('status', 'open');
      
    const { count: hrCasesCount } = await supabase
      .from('cases')
      .select('*', { count: 'exact', head: true })
      .ilike('status', 'open');

    // 2. SOP & Baranggay Specific Metrics (New)
    const { count: sopCriticalCount } = await supabase
      .from('ir_cases')
      .select('*', { count: 'exact', head: true })
      .or('sop_breakdown.ilike.*Critical*,sop_breakdown.ilike.*Terminal*');

    const { count: pendingSharessCount } = await supabase
      .from('ir_cases')
      .select('*', { count: 'exact', head: true })
      .ilike('baranggay_share', '%Pending%');

    // 3. Fetch L&D Assignments and Submissions
    const { count: ldAssigned } = await supabase
      .from('ld_assignments')
      .select('*', { count: 'exact', head: true });
      
    const { count: ldSubmitted } = await supabase
      .from('ld_submissions')
      .select('*', { count: 'exact', head: true });
      
    const ldCompletionRate = ldAssigned > 0 
      ? Math.round((ldSubmitted / ldAssigned) * 100) 
      : 0;

    // 4. Employees Total
    const { count: totalEmployees } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });

    // 5. Cash Payout Totals (Sensitive Outreach)
    const { data: cashData } = await supabase
      .from('ir_cases')
      .select('cash_amount');

    const totalCashPayout = cashData?.reduce((acc, curr) => acc + (curr.cash_amount || 0), 0) || 0;

    return {
      activeCases: (irCasesCount || 0) + (hrCasesCount || 0),
      ldCompletionRate: ldCompletionRate,
      totalEmployees: totalEmployees || 0,
      tellerIncidents: irCasesCount || 0,
      sopCritical: sopCriticalCount || 0,
      pendingShares: pendingSharessCount || 0,
      totalCashPayout: totalCashPayout
    };
  } catch (err) {
    console.error('Error fetching dashboard metrics:', err);
    return {
      activeCases: 0,
      ldCompletionRate: 0,
      totalEmployees: 0,
      tellerIncidents: 0,
      sopCritical: 0,
      pendingShares: 0
    };
  }
}

// Fetch Branch/Area Data
export async function getBranchData() {
  try {
    const { data: counters, error } = await supabase
      .from('ir_area_counters')
      .select('*');
      
    if (error) return [];
    
    return counters.map(c => ({
      name: c.area,
      cases: c.last_num,
      incidents: Math.floor(c.last_num * 1.5),
      share: c.last_num * 150 
    }));
  } catch(err) {
    console.error(err);
    return [];
  }
}
