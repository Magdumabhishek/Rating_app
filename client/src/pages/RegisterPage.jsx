import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', address: '', role: 'user'
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, form);
      alert('Registered successfully! Please login.');
      navigate('/login');
    } catch (err) {
      alert('Registration failed');
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required /> <br />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required /> <br />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required /> <br />
        <input name="address" placeholder="Address" value={form.address} onChange={handleChange} required /> <br />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="user">User</option>
          <option value="owner">Store Owner</option>
        </select><br /><br />
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <a href="/login">Login here</a></p>
    </div>
  );
};

export default RegisterPage;
