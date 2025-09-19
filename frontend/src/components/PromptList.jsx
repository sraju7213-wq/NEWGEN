import { formatDistanceToNow } from 'date-fns';
import { FiTrash2, FiEdit3 } from 'react-icons/fi';

const statusColors = {
  draft: 'rgba(148, 163, 184, 0.25)',
  published: 'rgba(16, 185, 129, 0.25)',
  archived: 'rgba(248, 113, 113, 0.25)'
};

const PromptList = ({ prompts, onSelect, onDelete, activePromptId }) => {
  if (!prompts?.length) {
    return <div className="alert">No prompts yet. Create your first prompt to get started.</div>;
  }

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
        <h3 className="section-title" style={{ marginBottom: '0.25rem' }}>Your prompts</h3>
        <p className="section-subtitle">Manage, share, and refine prompts with AI guidance.</p>
      </div>
      <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Title</th>
              <th style={{ textAlign: 'left' }}>Status</th>
              <th>Suggestions</th>
              <th style={{ textAlign: 'left' }}>Updated</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {prompts.map((prompt) => (
              <tr key={prompt.id} style={{ background: prompt.id === activePromptId ? 'rgba(56,189,248,0.08)' : 'transparent' }}>
                <td>
                  <button
                    type="button"
                    onClick={() => onSelect(prompt)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'inherit',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    {prompt.title || 'Untitled prompt'}
                  </button>
                  <div className="muted" style={{ fontSize: '0.75rem' }}>
                    {prompt.content.slice(0, 60)}{prompt.content.length > 60 ? '…' : ''}
                  </div>
                </td>
                <td>
                  <span
                    className="status-chip"
                    style={{
                      background: statusColors[prompt.status] || 'rgba(56,189,248,0.2)',
                      color: '#e0f2fe'
                    }}
                  >
                    {prompt.status}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>{prompt.suggestions?.length || 0}</td>
                <td>{formatDistanceToNow(new Date(prompt.updated_at), { addSuffix: true })}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      style={{ padding: '0.4rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={() => onSelect(prompt)}
                    >
                      <FiEdit3 /> Edit
                    </button>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      style={{ padding: '0.4rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(248,113,113,0.2)', borderColor: 'rgba(248,113,113,0.35)' }}
                      onClick={() => onDelete(prompt.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PromptList;
