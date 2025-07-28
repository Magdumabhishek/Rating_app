import React, { useEffect, useState } from 'react';
import { getRole, getToken, logout } from '../auth';
import axios from 'axios';

const Dashboard = () => {
  const role = getRole();
  const token = getToken();

  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [userStores, setUserStores] = useState([]);
  const [ownerStore, setOwnerStore] = useState(null);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // OWNER dashboard store fetch
  useEffect(() => {
    if (role === 'owner') {
      const fetchStore = async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/owner/my-store`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setOwnerStore(res.data);
        } catch (err) {
          console.error('Error loading store:', err);
        }
      };
      fetchStore();
    }
  }, [role, token]);

  // ADMIN dashboard fetch
  useEffect(() => {
    if (role === 'admin') {
      const fetchData = async () => {
        try {
          const headers = { Authorization: `Bearer ${token}` };
          const [dashRes, usersRes, storesRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/dashboard`, { headers }),
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/users`, { headers }),
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/stores`, { headers }),
          ]);
          setSummary(dashRes.data);
          setUsers(usersRes.data);
          setStores(storesRes.data);
        } catch (err) {
          console.error('Admin dashboard error:', err);
        }
      };
      fetchData();
    }
  }, [role, token]);

  // USER dashboard fetch
  useEffect(() => {
    if (role === 'user') {
      const fetchStores = async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/user/stores`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserStores(res.data);
        } catch (err) {
          console.error('Error loading stores:', err);
        }
      };
      fetchStores();
    }
  }, [role, token]);

  // USER rating submit
  const handleRate = async (storeId, rating) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/user/rate`,
        { store_id: storeId, rating: parseFloat(rating) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Rating submitted!');
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/user/stores`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserStores(res.data);
    } catch (err) {
      alert('Error submitting rating');
    }
  };

  // ADMIN Dashboard UI
  if (role === 'admin') {
    return (
      <div style={{ padding: 20 }}>
        <h2>Admin Dashboard</h2>
        <p><strong>Total Users:</strong> {summary?.userCount}</p>
        <p><strong>Total Stores:</strong> {summary?.storeCount}</p>
        <p><strong>Total Ratings:</strong> {summary?.ratingCount}</p>

        <hr />
        <h3>All Users</h3>
        <table border="1" cellPadding="8">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th><th>Address</th><th>Role</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.address}</td><td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />
        <h3>All Stores</h3>
        <table border="1" cellPadding="8">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Address</th><th>Rating</th></tr>
          </thead>
          <tbody>
            {stores.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td><td>{s.email}</td><td>{s.address}</td><td>{s.rating || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />
        <h3>Add New User</h3>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target;
          const newUser = {
            name: form.name.value,
            email: form.email.value,
            password: form.password.value,
            address: form.address.value,
            role: form.role.value
          };
          try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/admin/users`, newUser, {
              headers: { Authorization: `Bearer ${token}` }
            });
            alert("User added");
            form.reset();
          } catch (err) {
            alert("Error adding user");
          }
        }}>
          <input name="name" placeholder="Name" required />
          <input name="email" placeholder="Email" required />
          <input name="password" placeholder="Password" required />
          <input name="address" placeholder="Address" required />
          <select name="role" defaultValue="user">
            <option value="user">User</option>
            <option value="owner">Store Owner</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Add User</button>
        </form>

        <hr />
        <h3>Add New Store</h3>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target;
          const newStore = {
            name: form.name.value,
            email: form.email.value,
            address: form.address.value,
            owner_id: form.owner_id.value
          };
          try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/admin/stores`, newStore, {
              headers: { Authorization: `Bearer ${token}` }
            });
            alert("Store added");
            form.reset();
          } catch (err) {
            alert("Error adding store");
          }
        }}>
          <input name="name" placeholder="Store Name" required />
          <input name="email" placeholder="Email" required />
          <input name="address" placeholder="Address" required />
          <input name="owner_id" placeholder="Owner ID" required />
          <button type="submit">Add Store</button>
        </form>

        <br />
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  // OWNER Dashboard UI
  if (role === 'owner') {
    return (
      <div style={{ padding: 20 }}>
        <h2>Store Owner Dashboard</h2>
        {!ownerStore ? (
          <>
            <h3>Create Your Store</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target;
              const newStore = {
                name: form.name.value,
                email: form.email.value,
                address: form.address.value,
              };
              try {
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/owner/store`, newStore, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                alert("Store created!");
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/owner/my-store`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                setOwnerStore(res.data);
              } catch (err) {
                alert("Error creating store");
                console.error(err);
              }
            }}>
              <input name="name" placeholder="Store Name" required />
              <input name="email" placeholder="Email" required />
              <input name="address" placeholder="Address" required />
              <button type="submit">Create Store</button>
            </form>
          </>
        ) : (
          <>
            <p><strong>Store Name:</strong> {ownerStore.name}</p>
            <p><strong>Address:</strong> {ownerStore.address}</p>
            <p><strong>Email:</strong> {ownerStore.email}</p>
            <p><strong>Average Rating:</strong> {ownerStore.avg_rating ? Number(ownerStore.avg_rating).toFixed(1) : 'N/A'}</p>
            <h3>Ratings Received:</h3>
            <ul>
              {ownerStore.ratings && ownerStore.ratings.length > 0 ? (
                ownerStore.ratings.map((r, idx) => (
                  <li key={idx}>User ID: {r.user_id} – Rating: {r.rating}</li>
                ))
              ) : (
                <p>No ratings yet.</p>
              )}
            </ul>
          </>
        )}
        <br />
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  // USER Dashboard UI
  if (role === 'user') {
    return (
      <div style={{ padding: 20 }}>
        <h2>User Dashboard</h2>
        <p>You can browse and rate stores below.</p>
        <hr />
        <table border="1" cellPadding="8">
          <thead>
            <tr><th>Store</th><th>Average Rating</th><th>Your Rating</th><th>Rate Now</th></tr>
          </thead>
          <tbody>
            {userStores.map(store => (
              <tr key={store.id}>
                <td>{store.name}</td>
                <td>{store.rating || "N/A"}</td>
                <td>{store.user_rating || "Not Rated"}</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    defaultValue={store.user_rating || ""}
                    onBlur={(e) => handleRate(store.id, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <br />
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Unauthorized</h2>
      <p>This dashboard is only for admins, store owners, or users.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
