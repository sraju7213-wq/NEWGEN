import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPrompts, createPrompt, updatePrompt, deletePrompt, generateSuggestion, uploadPromptImage } from '../api/prompts';
import { fetchOverview } from '../api/analytics';
import PromptList from '../components/PromptList';
import PromptEditor from '../components/PromptEditor';
import BatchGenerator from '../components/BatchGenerator';
import SpeechRecorder from '../components/SpeechRecorder';
import ChatBot from '../components/ChatBot';
import AnalyticsSummary from '../components/AnalyticsSummary';
import { requestPromptGeneration } from '../api/ai';

const DashboardPage = () => {
  const queryClient = useQueryClient();
  const promptsQuery = useQuery({ queryKey: ['prompts'], queryFn: fetchPrompts });
  const analyticsQuery = useQuery({ queryKey: ['analytics'], queryFn: fetchOverview });
  const [selectedPromptId, setSelectedPromptId] = useState(null);
  const [creatingFromSeed, setCreatingFromSeed] = useState(false);

  useEffect(() => {
    if (!selectedPromptId && promptsQuery.data?.length) {
      setSelectedPromptId(promptsQuery.data[0].id);
    }
  }, [selectedPromptId, promptsQuery.data]);

  const selectedPrompt = useMemo(() => {
    if (!selectedPromptId) return null;
    return promptsQuery.data?.find((prompt) => prompt.id === selectedPromptId) || null;
  }, [selectedPromptId, promptsQuery.data]);

  const createMutation = useMutation({
    mutationFn: createPrompt,
    onSuccess: (prompt) => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setSelectedPromptId(prompt.id);
    }
  });

  const updateMutation = useMutation({
    mutationFn: updatePrompt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deletePrompt,
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      if (selectedPromptId === id) {
        setSelectedPromptId(null);
      }
    }
  });

  const suggestionMutation = useMutation({
    mutationFn: (promptId) => generateSuggestion(promptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });

  const uploadMutation = useMutation({
    mutationFn: uploadPromptImage
  });

  const seedMutation = useMutation({
    mutationFn: requestPromptGeneration,
    onSuccess: (data) => {
      setCreatingFromSeed(false);
      createMutation.mutate({ title: 'AI generated prompt', content: data.prompt, status: 'draft', metadata: {} });
    },
    onError: () => setCreatingFromSeed(false)
  });

  const handleSave = (form) => {
    if (form.id) {
      updateMutation.mutate({ ...form, metadata: form.metadata || {} });
    } else {
      createMutation.mutate({ title: form.title, content: form.content, status: form.status, metadata: form.metadata || {} });
    }
  };

  const handleNewPrompt = () => {
    setSelectedPromptId(null);
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  const handleSuggestion = (form) => {
    if (!form.id) {
      alert('Save the prompt before requesting suggestions.');
      return;
    }
    suggestionMutation.mutate(form.id);
  };

  const handleImageUpload = async ({ file, promptId }) => {
    await uploadMutation.mutateAsync({ file, promptId });
  };

  const handleBatchInsert = (promptText) => {
    if (!selectedPromptId || !selectedPrompt) {
      createMutation.mutate({ title: 'Batch idea', content: promptText, status: 'draft', metadata: {} });
    } else {
      updateMutation.mutate({ ...selectedPrompt, content: `${selectedPrompt.content}\n\n${promptText}` });
    }
  };

  const handleSpeechSeed = (transcript) => {
    if (!transcript) return;
    setCreatingFromSeed(true);
    seedMutation.mutate({ seed: transcript, context: selectedPrompt?.metadata?.goal || '' });
  };

  const isSaving = createMutation.isLoading || updateMutation.isLoading;

  return (
    <div className="grid-responsive" style={{ gap: '1.5rem' }}>
      <AnalyticsSummary data={analyticsQuery.data} />
      <div className="grid-responsive two" style={{ alignItems: 'start' }}>
        <PromptList
          prompts={promptsQuery.data}
          activePromptId={selectedPromptId}
          onSelect={(prompt) => setSelectedPromptId(prompt.id)}
          onDelete={handleDelete}
        />
        <PromptEditor
          prompt={selectedPrompt}
          onSave={handleSave}
          onNew={handleNewPrompt}
          onGenerateSuggestion={handleSuggestion}
          onUploadImage={handleImageUpload}
          isSaving={isSaving}
          suggestions={selectedPrompt?.suggestions}
        />
      </div>
      <div className="grid-responsive two">
        <BatchGenerator onInsertPrompt={handleBatchInsert} />
        <SpeechRecorder onTranscript={handleSpeechSeed} />
      </div>
      <ChatBot contextPrompt={selectedPrompt?.content || ''} />
      {creatingFromSeed && <div className="alert">Generating prompt ideas from your speech notes…</div>}
    </div>
  );
};

export default DashboardPage;
