import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import * as api from '../api.js';
import Spinner from '../components/Spinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import TaskForm from '../components/TaskForm.jsx';
import TaskItem from '../components/TaskItem.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import DelayedFallback from '../components/DelayedFallback.jsx';
import { useToast } from '../components/Toast.jsx';

// The chart library is only downloaded the first time "Show chart" is clicked
const TaskChart = lazy(() => import('../components/TaskChart.jsx'));

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [busyId, setBusyId] = useState(null); // task currently being updated/deleted
  const [toDelete, setToDelete] = useState(null); // task awaiting delete confirmation
  const [showChart, setShowChart] = useState(false);
  const notify = useToast();

  // READ: load tasks from the backend on mount (and on Retry)
  useEffect(() => {
    let ignore = false;
    api
      .getTasks()
      .then((data) => !ignore && setTasks(data))
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [attempt]);

  // Reset the request state in the event handler, not inside the effect
  const retry = () => {
    setLoading(true);
    setError(null);
    setAttempt((n) => n + 1);
  };

  // CREATE (optimistic): show the task immediately, then swap in the server's copy.
  // If the server rejects it, remove the placeholder again.
  const handleCreate = async (newTask) => {
    const tempId = `temp-${Date.now()}`;
    setTasks((list) => [{ ...newTask, _id: tempId, completed: false, pending: true }, ...list]);
    try {
      const saved = await api.createTask(newTask);
      setTasks((list) => list.map((t) => (t._id === tempId ? saved : t)));
      notify('Task created');
    } catch (err) {
      setTasks((list) => list.filter((t) => t._id !== tempId));
      notify(err.message, 'error');
    }
  };

  // UPDATE: wait for the server, then replace the task with its response.
  // useCallback keeps these functions identical between renders so memo(TaskItem) works.
  const handleUpdate = useCallback(
    async (task, changes, successMessage) => {
      setBusyId(task._id);
      try {
        const updated = await api.updateTask(task._id, changes);
        setTasks((list) => list.map((t) => (t._id === updated._id ? updated : t)));
        notify(successMessage);
      } catch (err) {
        notify(err.message, 'error');
      } finally {
        setBusyId(null);
      }
    },
    [notify]
  );

  const handleToggle = useCallback(
    (task) => handleUpdate(task, { completed: !task.completed }, task.completed ? 'Marked as open' : 'Marked as done'),
    [handleUpdate]
  );
  const handleRename = useCallback((task, title) => handleUpdate(task, { title }, 'Task renamed'), [handleUpdate]);

  // DELETE: only removed from the UI after the server confirms
  const handleDelete = async () => {
    const task = toDelete;
    setToDelete(null);
    setBusyId(task._id);
    try {
      await api.deleteTask(task._id);
      setTasks((list) => list.filter((t) => t._id !== task._id));
      notify('Task deleted');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Spinner label="Loading tasks" />;
  if (error) return <ErrorMessage title="Could not load tasks" message={error} onRetry={retry} />;

  const remaining = tasks.filter((t) => !t.completed).length;

  return (
    <section>
      <div className="toolbar">
        <h2>Tasks</h2>
        <span className="toolbar-end">
          <span className="muted">
            {remaining} open · {tasks.length} total
          </span>
          <button className="ghost small" onClick={() => setShowChart(!showChart)}>
            {showChart ? 'Hide chart' : 'Show chart'}
          </button>
        </span>
      </div>

      {showChart && (
        <Suspense fallback={<DelayedFallback label="Loading chart" />}>
          <TaskChart tasks={tasks} />
        </Suspense>
      )}

      <TaskForm onCreate={handleCreate} />

      {tasks.length === 0 ? (
        <p className="muted empty">No tasks yet. Add your first one above.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              busy={busyId === task._id}
              onToggle={handleToggle}
              onRename={handleRename}
              onDelete={setToDelete}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this task?"
        message={toDelete ? `"${toDelete.title}" will be removed permanently.` : ''}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
}
