import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { projectAPI, taskAPI } from '../api';
import { AuthContext } from '../context/AuthContext';
import { Plus, UserPlus, Calendar, Flag, CheckCircle, Trash2, Edit, Search, Filter } from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', due_date: '', priority: 'Medium', status: 'To Do', assigned_to_id: '' });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const { user } = useContext(AuthContext);

  const [filterStatus, setFilterStatus] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskData, setEditTaskData] = useState({ title: '', description: '', due_date: '', priority: 'Medium', status: 'To Do', assigned_to_id: '' });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id, filterStatus, filterAssignee, searchTitle]);

  const fetchProjectAndTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch project details specifically
      const pRes = await projectAPI.getProject(id);
      setProject(pRes.data);

      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterAssignee) params.assigned_to_id = filterAssignee;
      if (searchTitle) params.search = searchTitle;
      
      const tRes = await taskAPI.getTasks(id, params);
      setTasks(tRes.data);
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.detail || "An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...newTask,
        project_id: parseInt(id),
        due_date: newTask.due_date ? new Date(newTask.due_date).toISOString() : null,
        assigned_to_id: newTask.assigned_to_id ? parseInt(newTask.assigned_to_id) : null
      };
      await taskAPI.createTask(taskData);
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', due_date: '', priority: 'Medium', status: 'To Do', assigned_to_id: '' });
      fetchProjectAndTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...editTaskData,
        due_date: editTaskData.due_date ? new Date(editTaskData.due_date).toISOString() : null,
        assigned_to_id: editTaskData.assigned_to_id ? parseInt(editTaskData.assigned_to_id) : null
      };
      await taskAPI.updateTask(editingTask, taskData);
      setEditingTask(null);
      fetchProjectAndTasks();
    } catch (error) {
      console.error(error);
      alert('Failed to update task.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await taskAPI.deleteTask(taskId);
      fetchProjectAndTasks();
    } catch (error) {
      console.error(error);
      alert("Failed to delete task.");
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await projectAPI.addMember(id, newMemberEmail);
      setShowMemberModal(false);
      setNewMemberEmail('');
      fetchProjectAndTasks();
    } catch (error) {
      alert("Failed to add member. Check email and ensure they are registered.");
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await taskAPI.updateTask(taskId, { status: newStatus });
      fetchProjectAndTasks();
    } catch (error) {
      alert("Not authorized to update this task.");
    }
  };

  if (loading && !project) return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 className="fade-in">Loading project details...</h2>
      </div>
    </div>
  );

  if (error) return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>Error</h2>
        <p style={{ marginBottom: '1.5rem' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.href = '/projects'}>Back to Projects</button>
      </div>
    </div>
  );

  if (!project) return null;

  const isAdmin = project.admin_id === user.id;

  return (
    <div className="page-container fade-in">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>{project.name}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {isAdmin && (
            <>
              <button className="btn btn-secondary" onClick={() => setShowMemberModal(true)}>
                <UserPlus size={20} /> Add Member
              </button>
              <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
                <Plus size={20} /> Create Task
              </button>
            </>
          )}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '200px' }}>
          <Search size={18} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', color: 'white', width: '100%' }}
          />
        </div>
        <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} color="var(--text-secondary)" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none' }}>
            <option value="" style={{ color: 'black' }}>All Statuses</option>
            <option value="To Do" style={{ color: 'black' }}>To Do</option>
            <option value="In Progress" style={{ color: 'black' }}>In Progress</option>
            <option value="Done" style={{ color: 'black' }}>Done</option>
          </select>
        </div>
        <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none' }}>
            <option value="" style={{ color: 'black' }}>All Assignees</option>
            {project.members.map(m => (
              <option key={m.id} value={m.id} style={{ color: 'black' }}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {['To Do', 'In Progress', 'Done'].map(status => (
          <div key={status} style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: `2px solid var(--accent-color)` }}>{status}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tasks.filter(t => t.status === status).map(task => {
                 const assignee = project.members.find(m => m.id === task.assigned_to_id);
                 return (
                  <div key={task.id} className="glass-panel card">
                    <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h4 style={{ fontSize: '1.125rem' }}>{task.title}</h4>
                      {isAdmin && (
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button className="btn btn-sm" style={{ padding: '0.25rem', background: 'transparent', color: 'var(--text-secondary)' }} onClick={() => { setEditingTask(task.id); setEditTaskData({ title: task.title, description: task.description || '', due_date: task.due_date ? task.due_date.split('T')[0] : '', priority: task.priority, status: task.status, assigned_to_id: task.assigned_to_id || '' }); }}>
                            <Edit size={14} />
                          </button>
                          <button className="btn btn-sm" style={{ padding: '0.25rem', background: 'transparent', color: 'var(--danger-color)' }} onClick={() => handleDeleteTask(task.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    {task.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>{task.description}</p>}
                    
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      <span className={`badge ${task.priority.toLowerCase()}`}><Flag size={12} style={{ display: 'inline', marginRight: '4px' }} />{task.priority}</span>
                      {task.due_date && <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}><Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} /> {new Date(task.due_date).toLocaleDateString()}</span>}
                    </div>

                    <div className="flex-between" style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Assignee: {assignee ? assignee.name : 'Unassigned'}
                      </div>
                      
                      {status !== 'Done' && (isAdmin || task.assigned_to_id === user.id) && (
                        <button 
                          className="btn btn-secondary btn-sm" 
                          style={{ padding: '0.25rem 0.5rem' }}
                          onClick={() => updateTaskStatus(task.id, status === 'To Do' ? 'In Progress' : 'Done')}
                        >
                          {status === 'To Do' ? 'Start' : 'Complete'} <CheckCircle size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              {tasks.filter(t => t.status === status).length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {showMemberModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content fade-in">
            <div className="modal-header">
              <h2>Add Member</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowMemberModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="input-group">
                <label>User Email</label>
                <input type="email" required value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Add to Project</button>
            </form>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content fade-in">
            <div className="modal-header">
              <h2>Create Task</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowTaskModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="input-group">
                <label>Title</label>
                <input required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
              </div>
              <div className="grid-cols-2">
                <div className="input-group">
                  <label>Due Date</label>
                  <input type="date" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Priority</label>
                  <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label>Assign To</label>
                <select value={newTask.assigned_to_id} onChange={e => setNewTask({...newTask, assigned_to_id: e.target.value})}>
                  <option value="">Unassigned</option>
                  {project.members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Create Task</button>
            </form>
          </div>
        </div>
      )}

      {editingTask && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content fade-in">
            <div className="modal-header">
              <h2>Edit Task</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditingTask(null)}>&times;</button>
            </div>
            <form onSubmit={handleEditTask}>
              <div className="input-group">
                <label>Title</label>
                <input required value={editTaskData.title} onChange={e => setEditTaskData({...editTaskData, title: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea value={editTaskData.description} onChange={e => setEditTaskData({...editTaskData, description: e.target.value})} />
              </div>
              <div className="grid-cols-2">
                <div className="input-group">
                  <label>Due Date</label>
                  <input type="date" value={editTaskData.due_date} onChange={e => setEditTaskData({...editTaskData, due_date: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Priority</label>
                  <select value={editTaskData.priority} onChange={e => setEditTaskData({...editTaskData, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="grid-cols-2">
                <div className="input-group">
                  <label>Status</label>
                  <select value={editTaskData.status} onChange={e => setEditTaskData({...editTaskData, status: e.target.value})}>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Assign To</label>
                  <select value={editTaskData.assigned_to_id} onChange={e => setEditTaskData({...editTaskData, assigned_to_id: e.target.value})}>
                    <option value="">Unassigned</option>
                    {project.members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
