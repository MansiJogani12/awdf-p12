import { useState } from 'react';

const MAX = 280;

export default function Contact() {
  // State 1: the controlled input's value
  const [message, setMessage] = useState('');
  // State 2: toggles the help tooltip's visibility
  const [showHelp, setShowHelp] = useState(false);

  return (
    <section>
      <h2>Contact</h2>
      <label className="field">
        <span className="label-row">
          Message
          <button type="button" className="ghost small" onClick={() => setShowHelp(!showHelp)}>
            {showHelp ? 'Hide help' : 'Help'}
          </button>
        </span>
        {showHelp && (
          <span className="hint">Say hello, ask a question or share an idea. Keep it under {MAX} characters.</span>
        )}
        <textarea
          rows={4}
          maxLength={MAX}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <span className="count">{message.length} / {MAX}</span>
      </label>

      <div className="preview">
        <h3>Live preview</h3>
        <p>{message || 'Your message will appear here as you type.'}</p>
      </div>
    </section>
  );
}
