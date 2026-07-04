import type { ChatPropRow } from '@/data/chat-props';

export function PropTable({ rows }: { rows: ChatPropRow[] }) {
  return (
    <div className="docs-prop-table-wrap">
      <table className="docs-prop-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td>
                <code>{row.name}</code>
              </td>
              <td>
                <span className="docs-type-badge">{row.type}</span>
              </td>
              <td>
                <code className="docs-prop-default">{row.defaultValue ?? '—'}</code>
              </td>
              <td>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
