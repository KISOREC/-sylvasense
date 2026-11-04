import {
  Activity,
  Bell,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Cloud,
  Crosshair,
  Download,
  Eye,
  Filter,
  Layers3,
  MapPinned,
  Menu,
  MoreHorizontal,
  Search,
  Settings2,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  TreePine,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

const navItems = [
  { label: "Overview", icon: Activity, active: true },
  { label: "Monitoring map", icon: MapPinned },
  { label: "Change detection", icon: Crosshair },
  { label: "Analytics", icon: SlidersHorizontal },
  { label: "Reports", icon: Download },
];

export function DashboardPage() {
  return (
    <main className="command-shell">
      <h2 className="sr-only">SYLVASENSE</h2>
      <p className="sr-only">No monitoring data configured</p>
      <aside className="command-sidebar" aria-label="Primary navigation">
        <div className="brand-lockup"><div className="brand-mark"><TreePine size={19} /></div><div><strong>SYLVASENSE</strong><span>Forest intelligence</span></div><button className="collapse-button" aria-label="Collapse navigation"><Menu size={18} /></button></div>
        <div className="division-select"><span className="division-avatar">TN</span><span><small>FOREST DIVISION</small><b>Tamil Nadu</b></span><ChevronDown size={14} /></div>
        <p className="side-label">COMMAND CENTER</p>
        <nav>{navItems.map(({ label, icon: Icon, active }) => <a key={label} className={`side-nav ${active ? "selected" : ""}`} href={`#${label.toLowerCase().replace(/ /g, "-")}`}><Icon size={17} />{label}{label === "Change detection" && <span className="nav-count">03</span>}</a>)}</nav>
        <p className="side-label side-label-bottom">SYSTEM</p>
        <nav><a className="side-nav" href="#settings"><Settings2 size={17} />Settings</a><a className="side-nav" href="#support"><CircleHelp size={17} />Support</a></nav>
        <div className="system-state"><span className="pulse-dot" /><div><b>Workspace ready</b><small>Awaiting data connection</small></div></div>
      </aside>

      <section className="command-main">
        <header className="command-topbar"><div className="topbar-title"><button className="mobile-menu" aria-label="Open navigation"><Menu size={19} /></button><div><p className="micro-label">TAMIL NADU / FOREST ESTATE</p><h1>Operations overview</h1></div></div><div className="topbar-tools"><button className="search-control"><Search size={16} /><span>Search forest, area, report...</span><kbd>⌘ K</kbd></button><button className="top-icon" aria-label="Notifications"><Bell size={17} /><i /></button><button className="top-icon" aria-label="Settings"><Settings2 size={17} /></button><div className="account"><span>AR</span><b>Analyst</b><ChevronDown size={13} /></div></div></header>
        <div className="command-content">
          <div className="command-heading"><div><p className="micro-label">TUESDAY, 04 NOVEMBER 2026</p><h2>Forest watch</h2><p>Monitor ecological change across your protected estate.</p></div><div className="heading-actions"><button className="ghost-button"><Download size={15} />Export brief</button><button className="primary-button"><Sparkles size={15} />Start investigation</button></div></div>

          <section className="metric-strip" aria-label="Monitoring metrics"><Metric label="Monitored estate" value="38,640" unit="ha" detail="3 areas configured" tone="green" /><Metric label="Forest cover" value="—" unit="%" detail="Connect imagery to calculate" tone="neutral" /><Metric label="Active signals" value="—" unit="" detail="No detection feed connected" tone="amber" /><Metric label="Last observation" value="—" unit="" detail="Imagery date unavailable" tone="neutral" /></section>

          <section className="workspace-grid" id="monitoring-map">
            <div className="map-workspace"><div className="panel-head"><div><p className="micro-label">LIVE MONITORING MAP</p><h3>Estate intelligence workspace</h3></div><div className="panel-tools"><button aria-label="Map filters"><Filter size={15} /></button><button aria-label="Map layers"><Layers3 size={15} /></button><button aria-label="More map options"><MoreHorizontal size={17} /></button></div></div><div className="map-canvas"><div className="map-terrain"><div className="terrain-glow terrain-one" /><div className="terrain-glow terrain-two" /><div className="contour contour-a" /><div className="contour contour-b" /><div className="boundary boundary-one" /><div className="boundary boundary-two" /><div className="detection detection-one"><span /></div><div className="detection detection-two"><span /></div><div className="map-pin pin-one"><MapPinned size={15} /></div><div className="map-pin pin-two"><MapPinned size={15} /></div><div className="map-water" /><span className="map-label label-one">NILGIRI BIOSPHERE</span><span className="map-label label-two">ANAMALAI</span></div><div className="map-search"><Search size={14} /><span>Search location</span></div><div className="map-toolbar"><button aria-label="Zoom in"><ZoomIn size={16} /></button><button aria-label="Zoom out"><ZoomOut size={16} /></button><button aria-label="Recenter map"><Crosshair size={16} /></button></div><div className="map-status"><span className="live-dot" />Map layers unavailable<span>·</span>Connect a source to begin</div><div className="map-legend"><b>MAP LEGEND</b><span><i className="legend-swatch forest" />Forest boundary</span><span><i className="legend-swatch detection" />Change signal</span></div></div></div>
            <aside className="intelligence-panel"><div className="panel-head"><div><p className="micro-label">INTELLIGENCE PANEL</p><h3>Selected area</h3></div><button className="close-panel" aria-label="Close intelligence panel"><X size={16} /></button></div><div className="selected-area"><div className="area-orb"><TreePine size={22} /></div><div><h4>Western Ghats North</h4><p>12,480 ha · Nilgiri</p></div><span className="status-pill stable">STABLE</span></div><div className="panel-divider" /><div className="detail-list"><div><span>Forest type</span><b>Montane evergreen</b></div><div><span>Monitoring cadence</span><b>Weekly observation</b></div><div><span>Latest assessment</span><b className="muted-value">Not available</b></div></div><div className="empty-alert"><div className="empty-alert-icon"><ShieldAlert size={17} /></div><div><b>No active detections</b><p>Verified model signals will appear here when imagery is connected.</p></div></div><button className="outline-wide"><Eye size={15} />Open area details<ChevronRight size={15} /></button></aside>
          </section>

          <section className="lower-grid"><article className="analytics-card"><div className="panel-head"><div><p className="micro-label">FOREST COVER TREND</p><h3>Observation history</h3></div><button className="select-button">Last 12 months <ChevronDown size={13} /></button></div><div className="chart-empty"><div className="chart-lines"><span /><span /><span /><span /></div><div className="chart-copy"><Activity size={18} /><b>Trend data will appear here</b><p>Connect verified satellite imagery to establish your baseline.</p></div></div><div className="chart-axis"><span>JAN</span><span>APR</span><span>JUL</span><span>OCT</span><span>DEC</span></div></article><article className="activity-card"><div className="panel-head"><div><p className="micro-label">RECENT ACTIVITY</p><h3>Investigation log</h3></div><button className="text-button">View all <ChevronRight size={14} /></button></div><div className="activity-empty"><div className="activity-icon"><Cloud size={18} /></div><div><b>No investigation activity</b><p>New review actions and reports will be listed here.</p></div></div><div className="activity-row"><span className="activity-marker" /><div><b>Workspace initialized</b><small>System event · Just now</small></div></div></article></section>
          <footer className="command-footer">SylvaSense indicators support investigation and should be validated against field evidence; they are not proof of illegal activity. <span>Data sources are not connected.</span></footer>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value, unit, detail, tone }: { label: string; value: string; unit: string; detail: string; tone: string }) {
  return <article className={`metric-tile ${tone}`}><div className="metric-top"><span>{label}</span><MoreHorizontal size={15} /></div><strong>{value}<small>{unit}</small></strong><p>{detail}</p></article>;
}
