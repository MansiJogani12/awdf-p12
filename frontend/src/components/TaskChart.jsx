// Heavy third-party component: recharts adds ~100 kB (gzip) on its own,
// so it is lazy-loaded and only downloaded when the user opens the chart.
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const PRIORITIES = ['low', 'medium', 'high'];

export default function TaskChart({ tasks }) {
  const data = PRIORITIES.map((priority) => {
    const group = tasks.filter((t) => t.priority === priority);
    return {
      priority: priority[0].toUpperCase() + priority.slice(1),
      Open: group.filter((t) => !t.completed).length,
      Done: group.filter((t) => t.completed).length,
    };
  });

  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} vertical={false} />
          <XAxis dataKey="priority" tickLine={false} axisLine={false} fontSize={12} stroke="currentColor" />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} stroke="currentColor" />
          <Tooltip cursor={{ fillOpacity: 0.05 }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Open" stackId="a" fill="var(--accent)" radius={[0, 0, 4, 4]} />
          <Bar dataKey="Done" stackId="a" fill="var(--ink)" fillOpacity={0.25} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
