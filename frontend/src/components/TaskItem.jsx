import { memo, useState } from 'react';

// memo(): a row only re-renders when its own props change. Before this, toggling
// one task re-rendered every row in the list (found with the React DevTools Profiler).
// It only works because the parent passes stable callbacks (useCallback) that take
// the task as an argument, instead of new inline arrow functions on every render.
function TaskItem({ task, busy, onToggle, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);

  const save = () => {
    setEditing(false);
    if (draft.trim() && draft.trim() !== task.title) onRename(task, draft.trim());
    else setDraft(task.title);
  };

  return (
    <li className={`task ${task.completed ? 'done' : ''} ${busy || task.pending ? 'busy' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        disabled={busy || task.pending}
        onChange={() => onToggle(task)}
        aria-label="Mark complete"
      />
      <div className="task-body">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => e.key === 'Enter' && save()}
          />
        ) : (
          <span className="task-title" onDoubleClick={() => !task.pending && setEditing(true)}>
            {task.title}
          </span>
        )}
        {task.description && <span className="muted">{task.description}</span>}
      </div>
      <span className={`pill ${task.priority}`}>{task.priority}</span>
      <div className="task-actions">
        <button className="ghost small" disabled={busy || task.pending} onClick={() => setEditing(true)}>
          Edit
        </button>
        <button className="ghost small" disabled={busy || task.pending} onClick={() => onDelete(task)}>
          Delete
        </button>
      </div>
    </li>
  );
}

export default memo(TaskItem);
