export function DashboardPage() {
  return (
    <main className="shell min-h-screen">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">S</div>
        <div>
          <p className="eyebrow">FOREST INTELLIGENCE PLATFORM</p>
          <h1>SYLVASENSE</h1>
        </div>
        <span className="environment-badge">FOUNDATION</span>
      </header>
      <section className="welcome-panel" aria-labelledby="welcome-title">
        <p className="eyebrow">TAMIL NADU · EARLY WARNING</p>
        <h2 id="welcome-title">Forest monitoring workspace</h2>
        <p>
          The application foundation is ready. Verified satellite monitoring,
          division boundaries, and alert workflows will appear here as they are
          implemented.
        </p>
        <div className="status-row">
          <span className="status-dot" />
          No monitoring data configured
        </div>
      </section>
      <footer>Satellite anomalies are indicators for investigation, not proof of illegal activity.</footer>
    </main>
  );
}
