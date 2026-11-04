import { Activity, ArrowUpRight, Bell, ChevronDown, Clock3, Layers3, Map, Search, Settings2, ShieldCheck, TreePine } from "lucide-react";

const metrics = [
  { label: "Protected area", value: "—", detail: "Awaiting boundary source", icon: TreePine },
  { label: "Open investigations", value: "—", detail: "No alert feed connected", icon: ShieldCheck },
  { label: "Latest imagery", value: "—", detail: "Imagery date unavailable", icon: Clock3 },
];

export function DashboardPage() {
  return (
    <main className="app-shell">
      <h2 className="sr-only">SYLVASENSE</h2>
      <p className="sr-only">No monitoring data configured</p>
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true"><TreePine size={21} /></div>
          <div><strong>SYLVASENSE</strong><span>Forest intelligence</span></div>
        </div>
        <div className="workspace-switcher"><span className="workspace-avatar">TN</span><span><b>Tamil Nadu</b><small>Workspace</small></span><ChevronDown size={15} /></div>
        <nav>
          <p className="nav-label">Workspace</p>
          <a className="nav-item active" href="#overview"><Activity size={17} />Overview</a>
          <a className="nav-item" href="#map"><Map size={17} />Monitoring map</a>
          <a className="nav-item" href="#investigations"><ShieldCheck size={17} />Investigations</a>
          <a className="nav-item" href="#reports"><Layers3 size={17} />Reports</a>
          <p className="nav-label nav-label-spaced">Manage</p>
          <a className="nav-item" href="#settings"><Settings2 size={17} />Settings</a>
        </nav>
        <div className="sidebar-footer"><span className="status-dot" /><span><b>System ready</b><small>Data sources not connected</small></span></div>
      </aside>

      <section className="content-area">
        <header className="topbar">
          <div><p className="eyebrow">TAMIL NADU / OVERVIEW</p><h1>Forest monitoring workspace</h1></div>
          <div className="topbar-actions"><button className="icon-button" aria-label="Search"><Search size={18} /></button><button className="icon-button" aria-label="Notifications"><Bell size={18} /><span className="notification-dot" /></button><div className="user-chip"><span className="user-avatar">AR</span><span><b>Analyst</b><small>Research team</small></span></div></div>
        </header>

        <div className="page-content" id="overview">
          <div className="intro-row"><div><p className="eyebrow">COMMAND CENTER</p><h2>Good morning, Analyst</h2><p className="subhead">A clear view of your monitored forest estate starts here.</p></div><button className="outline-button"><Clock3 size={16} />Last sync: not configured</button></div>
          <section className="notice-panel" aria-labelledby="welcome-title"><div className="notice-icon"><Activity size={20} /></div><div><p className="eyebrow">WORKSPACE FOUNDATION</p><h3 id="welcome-title">Connect your first monitoring source</h3><p>SylvaSense is ready for verified satellite imagery, forest division boundaries, and alert workflows. Configure a source to begin establishing your baseline.</p><button className="primary-button">Configure data sources <ArrowUpRight size={16} /></button></div></section>
          <div className="section-heading"><div><p className="eyebrow">ESTATE SNAPSHOT</p><h3>Monitoring overview</h3></div><span className="data-badge">No live data</span></div>
          <div className="metric-grid">{metrics.map(({ label, value, detail, icon: Icon }) => <article className="metric-card" key={label}><div className="metric-icon"><Icon size={17} /></div><p>{label}</p><strong>{value}</strong><span>{detail}</span></article>)}</div>
          <section className="empty-state"><div className="empty-map"><div className="map-grid" /><Map size={31} /></div><div><p className="eyebrow">MONITORING MAP</p><h3>No forest estate selected</h3><p>Select a boundary source to view protected areas, imagery coverage, and model-derived indicators in context.</p><a href="#map">Open monitoring map <ArrowUpRight size={15} /></a></div></section>
          <footer>Satellite anomalies are indicators for investigation, not proof of illegal activity. <span>·</span> SylvaSense foundation build</footer>
        </div>
      </section>
    </main>
  );
}
