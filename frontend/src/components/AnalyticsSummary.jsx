import { FiActivity, FiBookOpen, FiSparkles } from 'react-icons/fi';

const AnalyticsSummary = ({ data }) => {
  const promptCount = data?.promptStats?.reduce((acc, item) => acc + item.count, 0) || 0;
  const draftCount = data?.promptStats?.find((item) => item.status === 'draft')?.count || 0;
  const publishedCount = data?.promptStats?.find((item) => item.status === 'published')?.count || 0;
  const suggestionCount = data?.suggestionsCount || 0;

  return (
    <div className="grid-responsive three">
      <div className="card">
        <div className="badge" style={{ marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <FiBookOpen /> Prompt library
        </div>
        <h2 style={{ margin: 0 }}>{promptCount}</h2>
        <p className="muted" style={{ marginBottom: '0.75rem' }}>Total prompts stored</p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <span className="badge-small">Drafts: {draftCount}</span>
          <span className="badge-small">Published: {publishedCount}</span>
        </div>
      </div>
      <div className="card">
        <div className="badge" style={{ marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <FiSparkles /> AI insights
        </div>
        <h2 style={{ margin: 0 }}>{suggestionCount}</h2>
        <p className="muted">AI suggestions generated</p>
      </div>
      <div className="card">
        <div className="badge" style={{ marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <FiActivity /> Activity
        </div>
        <h2 style={{ margin: 0 }}>{data?.activityCounts?.length || 0}</h2>
        <p className="muted">Unique interactions tracked</p>
      </div>
    </div>
  );
};

export default AnalyticsSummary;
