import { useState } from 'react';

export default function TaskForm({ onCreate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({ title: title.trim(), description: description.trim(), priority });
    setTitle('');
    setDescription('');
    setPriority('medium');
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs doing?" required />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
      />
      <div className="row">
        <select value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Priority">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button className="solid" type="submit" disabled={!title.trim()}>
          Add task
        </button>
      </div>
    </form>
  );
}
