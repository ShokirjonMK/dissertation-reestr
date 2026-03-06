type StatCardProps = {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning";
};

export default function StatCard({ label, value, tone = "default" }: StatCardProps) {
  return (
    <div className={`card stat-card ${tone}`}>
      <p>{label}</p>
      <h3>{value}</h3>
    </div>
  );
}
