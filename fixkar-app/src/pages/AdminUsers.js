"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../utils/api";
import "../App.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionModal, setActionModal] = useState(false);
  const [action, setAction] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user")) || {};

    if (!token || user.role !== "admin") {
      navigate("/unauthorized");
      return;
    }

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getUsers();
      setUsers(Array.isArray(data) ? data : data.users || []);
      setError(null);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId, actionType) => {
    try {
      if (actionType === "suspend") {
        await adminAPI.suspendUser(userId);
      } else if (actionType === "activate") {
        await adminAPI.activateUser(userId);
      } else if (actionType === "delete") {
        await adminAPI.deleteUser(userId);
      }

      const actionPastTense = {
        suspend: "suspended",
        activate: "activated",
        delete: "deleted",
      };

      await fetchUsers();
      setActionModal(false);
      alert(`User ${actionPastTense[actionType]} successfully`);
    } catch (err) {
      console.error("Error:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const UserRow = ({ user }) => (
    <tr key={user.user_id}>
      <td>{user.user_id}</td>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>{user.role}</td>
      <td>
        <span
          className={`status-badge ${user.is_active ? "active" : "inactive"}`}
        >
          {user.is_active ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="user-actions">
        {user.is_active ? (
          <button
            className="action-btn-small"
            onClick={() => {
              setSelectedUser(user);
              setAction("suspend");
              setActionModal(true);
            }}
          >
            Suspend
          </button>
        ) : (
          <button
            className="action-btn-small"
            onClick={() => {
              setSelectedUser(user);
              setAction("activate");
              setActionModal(true);
            }}
          >
            Activate
          </button>
        )}

        <button
          className="action-btn-small"
          onClick={() => {
            setSelectedUser(user);
            setAction("delete");
            setActionModal(true);
          }}
        >
          Delete
        </button>
      </td>
    </tr>
  );

  if (loading) return <div className="admin-loading">Loading users...</div>;
  if (error) return <div className="admin-error">Error: {error}</div>;

  return (
    <div className="admin-users">
      <div className="admin-header">
        <h1>User Management</h1>
        <p>Total Users: {users.length}</p>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRow key={user.user_id} user={user} />
            ))}
          </tbody>
        </table>
      </div>

      {actionModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Action</h3>
            <p>
              Are you sure you want to {action} user {selectedUser.name}?
              {action === "delete" && (
                <p className="deleteUser">
                  ⚠ Warning: Deleting this user will remove all their services,
                  bookings, and reviews!
                </p>
              )}
            </p>
            <div className="modal-actions">
              <button
                className="btn-confirm"
                onClick={() => handleAction(selectedUser.user_id, action)}
              >
                Confirm
              </button>
              <button
                className="btn-cancel"
                onClick={() => setActionModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
