import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "/users";


export default function Userapp() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", age: "" });
  const [editingId, setEditingId] = useState(null);

  const fetchUsers = async () => {
    const res = await axios.get(API);
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`${API}/${editingId}`, form);
    } else {
      await axios.post(API, form);
    }
    setForm({ name: "", email: "", age: "" });
    setEditingId(null);
    fetchUsers();
  };

  const handleEdit = user => {
    setForm(user);
    setEditingId(user._id);
  };

  const handleDelete = async id => {
    await axios.delete(`${API}/${id}`);
    fetchUsers();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>User Management </h1>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="age" placeholder="Age" value={form.age} onChange={handleChange} />
        <button type="submit">{editingId ? "Update" : "Add"} User</button>
      </form>

      <ul>
        {users.map(user => (
          <li key={user._id}>
            {user.name} ({user.email}, {user.age} years old)
            <button onClick={() => handleEdit(user)}>✏️ Edit</button>
            <button onClick={() => handleDelete(user._id)}>🗑 Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
