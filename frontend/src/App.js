import React, { useState, useEffect, useCallback } from 'react';
import { taskApi } from './api';
import './App.css';

const STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', IN_REVIEW: 'In Review', DONE: 'Done' };
const STATUS_COLORS = { TODO: '#6366f1', IN_PROGRESS: '#f59e0b', IN_REVIEW: '#8b5cf6', DONE: '#10b981' };
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const PRIORITY_COLORS = { LOW: '#64748b', MEDIUM: '#3b82f6', HIGH: '#f97316', CRITICAL: '#ef4444' };

const emptyForm = { title: '', description: '', status: 'TODO', priority: 'MEDIUM', assignee: '' };

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [view, setView] = useState('kanban'); // 'kanban' | 'list'

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (search) params.search = search;
      const [tasksRes, statsRes] = await Promise.all([
        taskApi.getAll(params),
        taskApi.getStats(),
      ]);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
      setError('');
    } catch (e) {
      setError('Failed to connect to backend. Is the Spring Boot server running?');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const openCreate = () => { setEditingTask(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (task) => { setEditingTask(task); setForm({ ...task }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await taskApi.update(editingTask.id, form);
      } else {
        await taskApi.create(form);
      }
      setShowModal(false);
      fetchTasks();
    } catch (e) {
      setError('Failed to save task.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await taskApi.delete(id);
    fetchTasks();
  };

  const handleStatusChange = async (id, status) => {
    await taskApi.updateStatus(id, status);
    fetchTasks();
  };

  const tasksByStatus = (status) => tasks.filter(t => t.status === status);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">⚡ TaskFlow</div>
          <span className="subtitle">Java + React · Deployment Practice</span>
        </div>
        <div className="header-right">
          <div className="search-wrap">
            <input
              className="search-input"
              placeholder="🔍 Search tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <div className="view-toggle">
            <button className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')}>⬛ Board</button>
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>☰ List</button>
          </div>
          <button className="btn-primary" onClick={openCreate}>+ New Task</button>
        </div>
      </header>

      {/* Stats Bar */}
      {stats && (
        <div className="stats-bar">
          {[
            { label: 'Total', value: stats.total, color: '#e2e8f0' },
            { label: 'To Do', value: stats.todo, color: STATUS_COLORS.TODO },
            { label: 'In Progress', value: stats.inProgress, color: STATUS_COLORS.IN_PROGRESS },
            { label: 'In Review', value: stats.inReview, color: STATUS_COLORS.IN_REVIEW },
            { label: 'Done', value: stats.done, color: STATUS_COLORS.DONE },
          ].map(({ label, value, color }) => (
            <div key={label} className="stat-card" style={{ borderTopColor: color }}>
              <div className="stat-value" style={{ color }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && <div className="error-banner">⚠️ {error}</div>}

      {/* Content */}
      <main className="main">
        {loading ? (
          <div className="loading">Loading tasks from Spring Boot API...</div>
        ) : view === 'kanban' ? (
          <div className="kanban-board">
            {STATUSES.map(status => (
              <div key={status} className="kanban-column">
                <div className="column-header" style={{ borderTopColor: STATUS_COLORS[status] }}>
                  <span className="column-dot" style={{ background: STATUS_COLORS[status] }} />
                  <span>{STATUS_LABELS[status]}</span>
                  <span className="column-count">{tasksByStatus(status).length}</span>
                </div>
                <div className="column-body">
                  {tasksByStatus(status).map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                  {tasksByStatus(status).length === 0 && (
                    <div className="empty-col">No tasks here</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="list-view">
            <table className="task-table">
              <thead>
                <tr>
                  <th>Title</th><th>Status</th><th>Priority</th><th>Assignee</th><th>Created</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id}>
                    <td><strong>{task.title}</strong><br /><small>{task.description}</small></td>
                    <td><StatusBadge status={task.status} /></td>
                    <td><PriorityBadge priority={task.priority} /></td>
                    <td>{task.assignee || '—'}</td>
                    <td>{task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <button className="btn-sm" onClick={() => openEdit(task)}>Edit</button>
                      <button className="btn-sm danger" onClick={() => handleDelete(task.id)}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tasks.length === 0 && <div className="empty-col" style={{padding:'2rem'}}>No tasks found</div>}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <label>Title *</label>
              <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title..." />

              <label>Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional details..." />

              <div className="form-row">
                <div>
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <div>
                  <label>Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <label>Assignee</label>
              <input value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })} placeholder="Name..." />

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editingTask ? 'Update Task' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  return (
    <div className="task-card">
      <div className="task-card-top">
        <PriorityBadge priority={task.priority} />
        <div className="task-actions">
          <button onClick={() => onEdit(task)} title="Edit">✏️</button>
          <button onClick={() => onDelete(task.id)} title="Delete">🗑️</button>
        </div>
      </div>
      <div className="task-title">{task.title}</div>
      {task.description && <div className="task-desc">{task.description}</div>}
      <div className="task-card-bottom">
        {task.assignee && <span className="assignee-chip">👤 {task.assignee}</span>}
        <select
          className="status-select"
          value={task.status}
          onChange={e => onStatusChange(task.id, e.target.value)}
        >
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className="badge" style={{ background: STATUS_COLORS[status] + '22', color: STATUS_COLORS[status], border: `1px solid ${STATUS_COLORS[status]}44` }}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function PriorityBadge({ priority }) {
  return (
    <span className="badge" style={{ background: PRIORITY_COLORS[priority] + '22', color: PRIORITY_COLORS[priority], border: `1px solid ${PRIORITY_COLORS[priority]}44` }}>
      {priority}
    </span>
  );
}
