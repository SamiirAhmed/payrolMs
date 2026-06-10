import Card from "../common/Card";

export default function ChartCard({ title, subtitle, children, action }) {
  return (
    <Card title={title} subtitle={subtitle} action={action} className="h-full">
      <div className="h-80">{children}</div>
    </Card>
  );
}
