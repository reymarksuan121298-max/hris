import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { ShieldAlert, TrendingUp, TrendingDown, Clock, Users, AlertTriangle, Building, Activity, Banknote } from 'lucide-react';
import { getDashboardMetrics, getBranchData } from '../api';

const mockRiskData = [
  { name: 'Week 1', incidents: 4, cases: 2, ldDrop: 8 },
  { name: 'Week 2', incidents: 5, cases: 3, ldDrop: 12 },
  { name: 'Week 3', incidents: 9, cases: 5, ldDrop: 22 },
  { name: 'Week 4', incidents: 14, cases: 8, ldDrop: 35 },
];

const MetricCard = ({ title, value, statusText, color, icon, detail }) => (
  <div className="glass-panel animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: `4px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
      {title}
      {icon}
    </div>
    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' }}>{value}</div>
    <div style={{ fontSize: '0.8rem', color: color, fontWeight: 'bold' }}>{statusText}</div>
    {detail && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{detail}</div>}
  </div>
);

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    activeCases: 0,
    ldCompletionRate: 0,
    totalEmployees: 0,
    tellerIncidents: 0,
    sopCritical: 0,
    pendingShares: 0,
    totalCashPayout: 0
  });

  const [branchesData, setBranchesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const fetchedMetrics = await getDashboardMetrics();
      const fetchedBranches = await getBranchData();

      if (fetchedMetrics) setMetrics(fetchedMetrics);

      if (fetchedBranches && fetchedBranches.length > 0) {
        setBranchesData(fetchedBranches);
      } else {
        setBranchesData([
          { name: 'Region 1 (HQ Context)', cases: 12, incidents: 25, share: 800 },
          { name: 'Region 2 (Rural Context)', cases: 4, incidents: 8, share: 1200 }
        ]);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Strategic Operational Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <MetricCard
          title="Local Enforcement Volume"
          value={`₱ ${metrics.totalCashPayout.toLocaleString()}`}
          statusText="Branch Cash Outreach"
          color="var(--accent-red)"
          icon={<Banknote size={18} color="var(--accent-red)" />}
          detail="Total Bribes / Assistance Payouts"
        />
        <MetricCard
          title="Critical SOP Breaches"
          value={metrics.sopCritical}
          statusText={metrics.sopCritical > 5 ? "Escalated" : "Controlled"}
          color="var(--accent-orange)"
          icon={<AlertTriangle size={18} />}
          detail="Enforcement Compliance Infractions"
        />
        <MetricCard
          title="Pending BNGY Shares"
          value={metrics.pendingShares}
          statusText="Awaiting Routing"
          color="var(--accent-purple)"
          icon={<Building size={18} />}
          detail="In-flight local cash allocations"
        />
        <MetricCard
          title="Verified Corporate Roster"
          value={metrics.totalEmployees}
          statusText="Resource Core"
          color="var(--accent-blue)"
          icon={<Users size={18} />}
          detail="Active Database Synchronized"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>

        {/* Risk Assessment Matrix */}
        <div className="glass-panel animate-fade-in delay-100" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Strategic Compliance Telemetry</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Correlation of Local Payout Volume vs SOP Incident Reported Feed</p>
          </div>
          <div style={{ position: 'relative', width: '100%', height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%" debounce={1}>
              <AreaChart data={mockRiskData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-red)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--accent-red)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-orange)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--accent-orange)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="incidents" stroke="var(--accent-red)" fillOpacity={1} fill="url(#colorInc)" name="Incident Vol" />
                <Area type="monotone" dataKey="ldDrop" stroke="var(--accent-orange)" fillOpacity={1} fill="url(#colorSop)" name="Compliance Lag" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tactical Insight Feed */}
        <div className="glass-panel animate-fade-in delay-200" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={20} color="var(--accent-red)" /> Enforcement Engine
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>

            <div style={{ background: 'rgba(255, 123, 114, 0.1)', border: '1px solid rgba(255, 123, 114, 0.3)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-red)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Expenditure Alert</div>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                System tracking <strong>₱ {metrics.totalCashPayout.toLocaleString()}</strong> in enforcement assistance & local bribes across active coverage maps.
              </p>
            </div>

            {metrics.sopCritical > 0 && (
              <div style={{ background: 'rgba(255, 165, 0, 0.1)', border: '1px solid rgba(255, 165, 0, 0.3)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-orange)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>SOP Compliance Alert</div>
                <p style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                  Detected <strong>{metrics.sopCritical}</strong> critical infractions linked to enforcement cash handovers.
                </p>
              </div>
            )}

            <div style={{ background: 'rgba(88, 166, 255, 0.1)', border: '1px solid rgba(88, 166, 255, 0.3)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Workforce Health</div>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                Roster integrity stable at <strong>{metrics.totalEmployees}</strong> verified personnel entries.
              </p>
            </div>

          </div>

          <button style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: '#fff', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
            Download Enforcement Audit Report
          </button>
        </div>

      </div>

      {/* Distribution Branches - Cash View */}
      <div className="glass-panel animate-fade-in delay-300" style={{ padding: '0' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Distribution Area Payout Overview</h3>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '16px' }}>Region Area</th>
              <th style={{ padding: '16px' }}>Local Cash Share (₱)</th>
              <th style={{ padding: '16px' }}>Incident Mapping</th>
              <th style={{ padding: '16px' }}>Strategic State</th>
            </tr>
          </thead>
          <tbody>
            {branchesData.map((branch, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '16px', fontWeight: 'bold' }}>{branch.name}</td>
                <td style={{ padding: '16px', color: 'var(--accent-red)', fontWeight: 'bold' }}>
                  ₱ {(branch.share || 0).toLocaleString()}
                </td>
                <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Mapped to {branch.cases} IR Incident Records
                </td>
                <td style={{ padding: '16px' }}>
                  {branch.cases > 10 ?
                    <span style={{ color: 'var(--accent-red)', fontSize: '0.85rem', fontWeight: 'bold' }}>ESCALATED PAYOUTS</span> :
                    <span style={{ color: 'var(--accent-green)', fontSize: '0.85rem', fontWeight: 'bold' }}>OPERATIONAL OPTIMIZED</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Dashboard;
