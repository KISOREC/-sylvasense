import { useEffect, useRef, useState } from "react";
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
            <div className="map-workspace"><div className="panel-head"><div><p className="micro-label">LIVE MONITORING MAP</p><h3>Estate intelligence workspace</h3></div><div className="panel-tools"><button aria-label="Map filters"><Filter size={15} /></button><button aria-label="Map layers"><Layers3 size={15} /></button><button aria-label="More map options"><MoreHorizontal size={17} /></button></div></div><MapWorkspace /></div>
            <aside className="intelligence-panel"><div className="panel-head"><div><p className="micro-label">INTELLIGENCE PANEL</p><h3>Selected area</h3></div><button className="close-panel" aria-label="Close intelligence panel"><X size={16} /></button></div><div className="selected-area"><div className="area-orb"><TreePine size={22} /></div><div><h4>Western Ghats North</h4><p>12,480 ha · Nilgiri</p></div><span className="status-pill stable">STABLE</span></div><div className="panel-divider" /><div className="detail-list"><div><span>Forest type</span><b>Montane evergreen</b></div><div><span>Monitoring cadence</span><b>Weekly observation</b></div><div><span>Latest assessment</span><b className="muted-value">Not available</b></div></div><div className="empty-alert"><div className="empty-alert-icon"><ShieldAlert size={17} /></div><div><b>No active detections</b><p>Verified model signals will appear here when imagery is connected.</p></div></div><button className="outline-wide"><Eye size={15} />Open area details<ChevronRight size={15} /></button></aside>
          </section>

          <section className="lower-grid"><article className="analytics-card"><div className="panel-head"><div><p className="micro-label">FOREST COVER TREND</p><h3>Observation history</h3></div><button className="select-button">Last 12 months <ChevronDown size={13} /></button></div><div className="chart-empty"><div className="chart-lines"><span /><span /><span /><span /></div><div className="chart-copy"><Activity size={18} /><b>Trend data will appear here</b><p>Connect verified satellite imagery to establish your baseline.</p></div></div><div className="chart-axis"><span>JAN</span><span>APR</span><span>JUL</span><span>OCT</span><span>DEC</span></div></article><article className="activity-card"><div className="panel-head"><div><p className="micro-label">RECENT ACTIVITY</p><h3>Investigation log</h3></div><button className="text-button">View all <ChevronRight size={14} /></button></div><div className="activity-empty"><div className="activity-icon"><Cloud size={18} /></div><div><b>No investigation activity</b><p>New review actions and reports will be listed here.</p></div></div><div className="activity-row"><span className="activity-marker" /><div><b>Workspace initialized</b><small>System event · Just now</small></div></div></article></section>
          <footer className="command-footer">SylvaSense indicators support investigation and should be validated against field evidence; they are not proof of illegal activity. <span>Data sources are not connected.</span></footer>
        </div>
      </section>
    </main>
  );
}

type LayerId = "forest" | "monitoring" | "candidate" | "alerts";

type MapLayer = {
  id: LayerId;
  label: string;
  description: string;
  color: string;
  visible: boolean;
  opacity: number;
  source: "backend" | "illustrative";
};

const initialLayers: MapLayer[] = [
  { id: "forest", label: "Forest boundary", description: "Authoritative GeoJSON", color: "#77d35b", visible: true, opacity: 0.72, source: "backend" },
  { id: "monitoring", label: "Monitoring areas", description: "Managed estate polygons", color: "#46b8ff", visible: true, opacity: 0.55, source: "backend" },
  { id: "candidate", label: "Candidate change", description: "Unverified model candidates", color: "#f2b84b", visible: true, opacity: 0.74, source: "backend" },
  { id: "alerts", label: "Verified alerts", description: "Field-reviewed detections", color: "#ff6f61", visible: true, opacity: 0.86, source: "backend" },
];

function MapWorkspace() {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<{ data?: { addGeoJson: (data: unknown) => void } } | null>(null);
  const [layers, setLayers] = useState(initialLayers);
  const [layerManagerOpen, setLayerManagerOpen] = useState(true);
  const [selectedDetection, setSelectedDetection] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [apiState, setApiState] = useState<"idle" | "loading" | "connected" | "unavailable">("idle");
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !mapElement.current) return;
    setApiState("loading");
    const existing = document.querySelector<HTMLScriptElement>('script[data-sylvasense-maps]');
    const script = existing ?? document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.dataset.sylvasenseMaps = "true";
    const initialise = () => {
      const maps = (window as Window & { google?: { maps?: { Map: new (element: HTMLElement, options: object) => unknown } } }).google?.maps;
      if (!maps || !mapElement.current) return;
      mapInstance.current = new maps.Map(mapElement.current, { center: { lat: 11.4, lng: 76.7 }, zoom: 9, mapTypeId: "satellite", disableDefaultUI: true, clickableIcons: false }) as { data?: { addGeoJson: (data: unknown) => void } };
      setMapReady(true);
      setApiState("connected");
    };
    script.addEventListener("load", initialise);
    if (!existing) document.head.appendChild(script);
    return () => script.removeEventListener("load", initialise);
  }, []);

  useEffect(() => {
    const endpoint = import.meta.env.VITE_GEOJSON_ENDPOINT;
    if (!endpoint) {
      setApiState((state) => state === "idle" ? "unavailable" : state);
      return;
    }
    let cancelled = false;
    fetch(endpoint).then((response) => {
      if (!response.ok) throw new Error(`GeoJSON request failed: ${response.status}`);
      return response.json();
    }).then((geoJson) => { if (!cancelled) { mapInstance.current?.data?.addGeoJson(geoJson); setApiState("connected"); } }).catch(() => { if (!cancelled) setApiState("unavailable"); });
    return () => { cancelled = true; };
  }, []);

  const toggleLayer = (id: LayerId) => setLayers((current) => current.map((layer) => layer.id === id ? { ...layer, visible: !layer.visible } : layer));
  const changeOpacity = (id: LayerId, opacity: number) => setLayers((current) => current.map((layer) => layer.id === id ? { ...layer, opacity } : layer));
  const statusLabel = apiState === "connected" && mapReady ? "Satellite basemap connected" : apiState === "loading" ? "Loading satellite basemap" : "Satellite and GeoJSON sources not connected";

  return <div className="map-canvas gis-canvas">
    <div ref={mapElement} className={`google-map ${mapReady ? "is-ready" : ""}`} aria-label="Interactive satellite monitoring map" />
    {!mapReady && <div className="illustrative-map" aria-label="Illustrative map preview, not a real detection"><div className="terrain-glow terrain-one" /><div className="terrain-glow terrain-two" /><div className="contour contour-a" /><div className="contour contour-b" /><div className="boundary boundary-one" /><div className="boundary boundary-two" /><button className="detection detection-one" onClick={() => setSelectedDetection(true)} aria-label="Illustrative candidate change, not a detection"><span /></button><button className="detection detection-two" onClick={() => setSelectedDetection(true)} aria-label="Illustrative candidate change, not a detection"><span /></button><div className="map-pin pin-one"><MapPinned size={15} /></div><div className="map-pin pin-two"><MapPinned size={15} /></div><div className="map-water" /><span className="map-label label-one">NILGIRI BIOSPHERE</span><span className="map-label label-two">ANAMALAI</span><span className="illustrative-label">ILLUSTRATIVE PREVIEW · NOT A DETECTION</span></div>}
    <div className="map-search"><Search size={14} /><input aria-label="Search map location" placeholder="Search location" /></div>
    <div className="map-toolbar"><button aria-label="Zoom in"><ZoomIn size={16} /></button><button aria-label="Zoom out"><ZoomOut size={16} /></button><button aria-label="Reset map view"><Crosshair size={16} /></button><button aria-label="Toggle before and after comparison" className={compareMode ? "active" : ""} onClick={() => setCompareMode(!compareMode)}><SlidersHorizontal size={16} /></button></div>
    <div className="map-source-status"><span className={`live-dot ${apiState === "connected" ? "connected" : ""}`} />{statusLabel}<span>·</span><button onClick={() => setCompareMode(true)}>Before / after foundation</button></div>
    {compareMode && <div className="compare-foundation"><div><b>BEFORE / AFTER</b><span>Imagery comparison foundation</span></div><button aria-label="Close comparison" onClick={() => setCompareMode(false)}><X size={14} /></button><p>Connect two dated satellite assets to compare this viewport. No imagery is loaded yet.</p></div>}
    <button className="layer-toggle" aria-expanded={layerManagerOpen} onClick={() => setLayerManagerOpen(!layerManagerOpen)}><Layers3 size={15} />Layers <ChevronRight className={layerManagerOpen ? "rotated" : ""} size={14} /></button>
    {layerManagerOpen && <div className="layer-manager"><div className="layer-manager-head"><div><b>Layer manager</b><small>GeoJSON overlays</small></div><button aria-label="Close layer manager" onClick={() => setLayerManagerOpen(false)}><X size={14} /></button></div>{layers.map((layer) => <div className="layer-row" key={layer.id}><button className={`layer-visibility ${layer.visible ? "on" : ""}`} aria-label={`${layer.visible ? "Hide" : "Show"} ${layer.label}`} onClick={() => toggleLayer(layer.id)}><Eye size={13} /></button><span className="layer-color" style={{ backgroundColor: layer.color }} /><div className="layer-copy"><b>{layer.label}</b><small>{layer.description} · {layer.source === "illustrative" ? "Demo" : "API"}</small><input aria-label={`${layer.label} opacity`} type="range" min="0" max="100" value={layer.opacity * 100} onChange={(event) => changeOpacity(layer.id, Number(event.target.value) / 100)} /></div><span className="layer-percent">{Math.round(layer.opacity * 100)}%</span></div>)}</div>}
    <div className="map-legend"><b>MAP LEGEND</b>{layers.filter((layer) => layer.visible).map((layer) => <span key={layer.id}><i className="legend-swatch" style={{ backgroundColor: layer.color }} />{layer.label}</span>)}</div>
    {selectedDetection && <div className="detection-inspector"><div className="inspector-head"><div><p className="micro-label">CANDIDATE INSPECTION</p><b>Illustrative candidate</b></div><button aria-label="Close detection details" onClick={() => setSelectedDetection(false)}><X size={14} /></button></div><p>This marker is synthetic UI content. It is not sourced from satellite imagery or an official alert feed.</p><dl><div><dt>Confidence</dt><dd>Not available</dd></div><div><dt>Severity</dt><dd>Not assessed</dd></div><div><dt>Field verification</dt><dd>Not verified</dd></div></dl></div>}
  </div>;
}

function Metric({ label, value, unit, detail, tone }: { label: string; value: string; unit: string; detail: string; tone: string }) {
  return <article className={`metric-tile ${tone}`}><div className="metric-top"><span>{label}</span><MoreHorizontal size={15} /></div><strong>{value}<small>{unit}</small></strong><p>{detail}</p></article>;
}
