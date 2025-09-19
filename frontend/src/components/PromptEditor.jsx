import { useEffect, useMemo, useState } from 'react';
import { FiSave, FiSparkles, FiUploadCloud, FiUsers, FiRefreshCw } from 'react-icons/fi';
import { usePromptCollaboration } from '../hooks/usePromptCollaboration';

const emptyPrompt = {
  id: null,
  title: '',
  content: '',
  status: 'draft',
  metadata: {}
};

const statusOptions = ['draft', 'published', 'archived'];

const PromptEditor = ({
  prompt,
  onSave,
  onNew,
  onGenerateSuggestion,
  onUploadImage,
  isSaving,
  suggestions
}) => {
  const [form, setForm] = useState(prompt || emptyPrompt);
  const [activeTab, setActiveTab] = useState('editor');
  const [uploading, setUploading] = useState(false);

  const selectedPromptId = prompt?.id || null;

  useEffect(() => {
    setForm(prompt || emptyPrompt);
  }, [prompt]);

  const { emitEdit, emitCursor, connectedUsers } = usePromptCollaboration(selectedPromptId, (remoteContent) => {
    setForm((prev) => ({ ...prev, content: remoteContent }));
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'content' && selectedPromptId) {
      emitEdit(value);
    }
  };

  const handleCursor = (event) => {
    emitCursor(event.target.selectionStart);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(form);
  };

  const handleApplySuggestion = (suggestionText) => {
    setForm((prev) => ({ ...prev, content: `${prev.content}\n\n${suggestionText}`.trim() }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onUploadImage({ file, promptId: selectedPromptId });
    } finally {
      setUploading(false);
    }
  };

  const metadataTags = useMemo(() => {
    if (!form.metadata?.tags) return [];
    if (Array.isArray(form.metadata.tags)) return form.metadata.tags;
    return String(form.metadata.tags)
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, [form.metadata]);

  return (
    <div className="card" style={{ display: 'grid', gap: '1rem' }}>
      <div className="flex-between" style={{ alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h3 className="section-title">Prompt editor</h3>
          <p className="section-subtitle">Collaborate in real-time and leverage Gemini to enhance your prompt.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" type="button" onClick={onNew}>
            Start new prompt
          </button>
          <button className="btn btn-primary" type="button" onClick={() => onGenerateSuggestion(form)}>
            <FiSparkles />
            <span style={{ marginLeft: '0.4rem' }}>AI refine</span>
          </button>
          <button className="btn btn-primary" type="submit" form="prompt-form" disabled={isSaving}>
            <FiSave />
            <span style={{ marginLeft: '0.4rem' }}>{isSaving ? 'Saving...' : 'Save prompt'}</span>
          </button>
        </div>
      </div>

      <div className="tablist">
        <button
          type="button"
          onClick={() => setActiveTab('editor')}
          className={activeTab === 'editor' ? 'active' : ''}
        >
          Editor
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('suggestions')}
          className={activeTab === 'suggestions' ? 'active' : ''}
        >
          AI Suggestions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('metadata')}
          className={activeTab === 'metadata' ? 'active' : ''}
        >
          Metadata
        </button>
      </div>

      {activeTab === 'editor' && (
        <form id="prompt-form" onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label className="muted" htmlFor="title">Title</label>
            <input
              id="title"
              className="input"
              value={form.title}
              placeholder="e.g. Personalized onboarding email"
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>
          <div>
            <label className="muted" htmlFor="status">Status</label>
            <select
              id="status"
              className="input"
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="muted" htmlFor="content">Prompt content</label>
            <textarea
              id="content"
              value={form.content}
              placeholder="Describe the task, tone, and goals for Gemini..."
              onChange={(e) => handleChange('content', e.target.value)}
              onSelect={handleCursor}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <label className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiUploadCloud /> Upload reference image
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
            </label>
            {uploading && <span className="badge">Uploading image…</span>}
            {connectedUsers.length > 0 && (
              <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <FiUsers /> {connectedUsers.length + 1} collaborators
              </span>
            )}
          </div>
        </form>
      )}

      {activeTab === 'suggestions' && (
        <div className="card" style={{ background: 'rgba(15,23,42,0.4)', border: '1px dashed rgba(148,163,184,0.4)' }}>
          <h4 className="section-title" style={{ fontSize: '1rem' }}>Gemini suggestions</h4>
          <p className="section-subtitle">Click a suggestion to append it to your prompt.</p>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {(suggestions || []).map((suggestion) => (
              <div key={suggestion.id} className="card" style={{ background: 'rgba(56,189,248,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge-small" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Gemini</span>
                  <button className="btn btn-secondary" type="button" onClick={() => handleApplySuggestion(suggestion.suggestion_text)}>
                    <FiRefreshCw /> Apply
                  </button>
                </div>
                <p style={{ marginTop: '0.75rem', whiteSpace: 'pre-wrap' }}>{suggestion.suggestion_text}</p>
              </div>
            ))}
            {!suggestions?.length && <p className="muted">Request Gemini suggestions to see recommendations here.</p>}
          </div>
        </div>
      )}

      {activeTab === 'metadata' && (
        <div className="card" style={{ background: 'rgba(15,23,42,0.4)', border: '1px dashed rgba(148,163,184,0.4)' }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label className="muted" htmlFor="tags">Tags</label>
              <input
                id="tags"
                className="input"
                value={metadataTags.join(', ')}
                placeholder="marketing, onboarding, personalized"
                onChange={(e) => setForm((prev) => ({
                  ...prev,
                  metadata: {
                    ...prev.metadata,
                    tags: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean)
                  }
                }))}
              />
            </div>
            <div>
              <label className="muted" htmlFor="audience">Target audience</label>
              <input
                id="audience"
                className="input"
                value={form.metadata?.audience || ''}
                placeholder="e.g. New SaaS customers"
                onChange={(e) => setForm((prev) => ({
                  ...prev,
                  metadata: { ...prev.metadata, audience: e.target.value }
                }))}
              />
            </div>
            <div>
              <label className="muted" htmlFor="goal">Campaign goal</label>
              <input
                id="goal"
                className="input"
                value={form.metadata?.goal || ''}
                placeholder="Drive signups, highlight features..."
                onChange={(e) => setForm((prev) => ({
                  ...prev,
                  metadata: { ...prev.metadata, goal: e.target.value }
                }))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptEditor;
