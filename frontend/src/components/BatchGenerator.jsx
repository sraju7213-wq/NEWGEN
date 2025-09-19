import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { requestBatchGeneration } from '../api/ai';

const BatchGenerator = ({ onInsertPrompt }) => {
  const [form, setForm] = useState({ theme: '', keywords: '', tone: 'creative', count: 5 });
  const mutation = useMutation({
    mutationFn: requestBatchGeneration
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate({
      theme: form.theme,
      keywords: form.keywords.split(',').map((kw) => kw.trim()).filter(Boolean),
      tone: form.tone,
      count: Number(form.count)
    });
  };

  return (
    <div className="card" style={{ display: 'grid', gap: '1rem' }}>
      <div className="flex-between" style={{ alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h3 className="section-title">Batch prompt generation</h3>
          <p className="section-subtitle">Create multiple prompts at once using Gemini parameters.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label className="muted" htmlFor="batch-theme">Theme</label>
          <input
            id="batch-theme"
            className="input"
            value={form.theme}
            onChange={(e) => setForm({ ...form, theme: e.target.value })}
            placeholder="Customer onboarding series"
            required
          />
        </div>
        <div>
          <label className="muted" htmlFor="batch-keywords">Keywords</label>
          <input
            id="batch-keywords"
            className="input"
            value={form.keywords}
            onChange={(e) => setForm({ ...form, keywords: e.target.value })}
            placeholder="personalized, milestone, retention"
          />
        </div>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
          <div>
            <label className="muted" htmlFor="batch-tone">Tone</label>
            <select
              id="batch-tone"
              className="input"
              value={form.tone}
              onChange={(e) => setForm({ ...form, tone: e.target.value })}
            >
              <option value="creative">Creative</option>
              <option value="professional">Professional</option>
              <option value="playful">Playful</option>
              <option value="technical">Technical</option>
            </select>
          </div>
          <div>
            <label className="muted" htmlFor="batch-count">Count</label>
            <input
              id="batch-count"
              type="number"
              min="1"
              max="10"
              className="input"
              value={form.count}
              onChange={(e) => setForm({ ...form, count: e.target.value })}
            />
          </div>
        </div>
        <button className="btn btn-primary" type="submit" disabled={mutation.isLoading}>
          {mutation.isLoading ? 'Generating…' : 'Generate prompts'}
        </button>
      </form>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {mutation.data?.prompts?.map((prompt, index) => (
          <div key={index} className="card" style={{ background: 'rgba(56,189,248,0.08)' }}>
            <div className="flex-between" style={{ alignItems: 'flex-start', gap: '0.5rem' }}>
              <div>
                <strong>Idea {index + 1}</strong>
                <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{prompt}</p>
              </div>
              <button className="btn btn-secondary" type="button" onClick={() => onInsertPrompt(prompt)}>
                Insert
              </button>
            </div>
          </div>
        ))}
        {mutation.isError && <div className="alert">{mutation.error.message}</div>}
      </div>
    </div>
  );
};

export default BatchGenerator;
