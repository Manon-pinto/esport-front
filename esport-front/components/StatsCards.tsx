interface StatCard {
  label: string
  value: string | number
}

export default function StatsCards({ stats }: { stats: StatCard[] }) {
  return (
    <div className="stats-grid" style={{ display: 'grid' }}>
      {stats.map((s, i) => (
        <div key={i} className="stat-card">
          <p className="stat-label">{s.label}</p>
          <p className="stat-value">{s.value}</p>
        </div>
      ))}
    </div>
  )
}