import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { requestChatCompletion } from '../api/ai';

const ChatBot = ({ contextPrompt }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'user', content: 'You are a collaborative assistant helping refine prompts for creative teams.' }
  ]);

  const mutation = useMutation({
    mutationFn: requestChatCompletion,
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: 'model', content: data.response }]);
    },
    onError: (error) => {
      setMessages((prev) => [...prev, { role: 'model', content: `I encountered an error: ${error.message}` }]);
    }
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!input.trim()) return;
    const updatedMessages = [...messages, { role: 'user', content: `${input}${contextPrompt ? `\nContext: ${contextPrompt}` : ''}` }];
    setMessages(updatedMessages);
    setInput('');
    mutation.mutate(updatedMessages);
  };

  return (
    <div className="card" style={{ display: 'grid', gap: '1rem', maxHeight: '400px' }}>
      <div>
        <h3 className="section-title">Gemini copilot</h3>
        <p className="section-subtitle">Ask Gemini for advice on improving tone, personalization, or strategy.</p>
      </div>
      <div style={{ flex: '1', overflowY: 'auto', display: 'grid', gap: '0.75rem' }}>
        {messages.slice(1).map((message, index) => (
          <div
            key={index}
            className="card"
            style={{
              background: message.role === 'user' ? 'rgba(56,189,248,0.12)' : 'rgba(34,197,94,0.12)',
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '90%'
            }}
          >
            <strong style={{ display: 'block', marginBottom: '0.35rem' }}>
              {message.role === 'user' ? 'You' : 'Gemini'}
            </strong>
            <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
          </div>
        ))}
        {mutation.isLoading && <div className="muted">Gemini is thinking…</div>}
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Gemini for help with personalization or structure"
        />
        <button className="btn btn-primary" type="submit" disabled={mutation.isLoading}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBot;
