import { FiMic, FiSquare } from 'react-icons/fi';
import { useSpeechToText } from '../hooks/useSpeechToText';

const SpeechRecorder = ({ onTranscript }) => {
  const { transcript, isRecording, error, startRecording, stopRecording, reset } = useSpeechToText();

  const handleToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      reset();
      startRecording();
    }
  };

  return (
    <div className="card" style={{ display: 'grid', gap: '1rem' }}>
      <div className="flex-between" style={{ alignItems: 'center' }}>
        <div>
          <h3 className="section-title">Speech to prompt</h3>
          <p className="section-subtitle">Record ideas and convert them into prompt-ready text automatically.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={handleToggle}>
          {isRecording ? (
            <>
              <FiSquare /> Stop recording
            </>
          ) : (
            <>
              <FiMic /> Start recording
            </>
          )}
        </button>
      </div>
      {error && <div className="alert">{error}</div>}
      <textarea
        value={transcript}
        onChange={() => {}}
        readOnly
        placeholder="Your spoken ideas will appear here..."
        style={{ minHeight: '120px' }}
      />
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" type="button" onClick={() => onTranscript(transcript)} disabled={!transcript}>
          Use as prompt seed
        </button>
        <button className="btn btn-secondary" type="button" onClick={reset}>
          Clear
        </button>
      </div>
    </div>
  );
};

export default SpeechRecorder;
