import React, { useState } from 'react';
import { registerUser } from '../services';
import { useNavigate } from 'react-router-dom';

export default function AdminCreateUserForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await registerUser(formData);
      if (res?.status) {
        setMessage('✅ User created successfully!');
        setFormData({ username: '', email: '', password: '', role: '' });
      } else {
        setMessage(`❌ ${res?.error || 'Creation failed'}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Creation failed.');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <div className="card shadow p-4">
        <h3 className="mb-4 text-center">Create New User</h3>
        {message && <div className={`alert ${message.startsWith('✅') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} className="form-control"/>
          </div>
          <div className="mb-3">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control"/>
          </div>
          <div className="mb-3">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-control"/>
          </div>
          <div className="mb-3">
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange} className="form-select">
              <option value="">Select Role</option>
              <option value="sales">Sales</option>
              <option value="leads">Leads</option>
              <option value="recruiter">Recruiter</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary w-100">Create User</button>
        </form>
      </div>
    </div>
  );
}
