import React, { useEffect, useState, useContext } from 'react';
import { projectAPI } from '../api';
import { Link } from 'react-router-dom';
import { Plus, Users, Edit, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [editingProject, setEditingProject] = useState(null);
  const [editProjectData, setEditProjectData] = useState({ name: '', description: '' });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await projectAPI.getProjects();
      setProjects(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await projectAPI.createProject(newProject);
      setShowModal(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectAPI.deleteProject(id);
      fetchProjects();
    } catch (error) {
      console.error(error);
      alert('Failed to delete project');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await projectAPI.updateProject(editingProject, editProjectData);
      setEditingProject(null);
      fetchProjects();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h1>Projects</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Create Project
        </button>
      </div>

      <div className="grid-cols-3">
        {projects.map(project => (
          <div key={project.id} className="glass-panel card">
            <div className="card-header">
              <h3 className="card-title">{project.name}</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {project.admin_id === user.id && (
                  <>
                    <button className="btn btn-sm" style={{ background: 'transparent', padding: '0.25rem', color: 'var(--text-secondary)' }} onClick={() => { setEditingProject(project.id); setEditProjectData({ name: project.name, description: project.description }); }}>
                      <Edit size={16} />
                    </button>
                    <button className="btn btn-sm" style={{ background: 'transparent', padding: '0.25rem', color: 'var(--danger-color)' }} onClick={() => handleDelete(project.id)}>
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
                {project.admin_id === user.id && <span className="badge" style={{ background: 'var(--accent-color)', color: 'white' }}>Admin</span>}
              </div>
            </div>
            <p className="card-body">{project.description}</p>
            <div className="card-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <Users size={16} /> {project.members.length} Members
              </div>
              <Link to={`/projects/${project.id}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                View Project
              </Link>
            </div>
          </div>
        ))}
        {projects.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No projects found. Create one to get started!</p>}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content fade-in">
            <div className="modal-header">
              <h2>Create Project</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)} style={{ padding: '0.25rem 0.5rem', fontSize: '1.25rem' }}>&times;</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="input-group">
                <label>Project Name</label>
                <input required value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea rows="3" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})}></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Create Project</button>
            </form>
          </div>
        </div>
      )}

      {editingProject && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content fade-in">
            <div className="modal-header">
              <h2>Edit Project</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingProject(null)} style={{ padding: '0.25rem 0.5rem', fontSize: '1.25rem' }}>&times;</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="input-group">
                <label>Project Name</label>
                <input required value={editProjectData.name} onChange={e => setEditProjectData({...editProjectData, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea rows="3" value={editProjectData.description} onChange={e => setEditProjectData({...editProjectData, description: e.target.value})}></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
