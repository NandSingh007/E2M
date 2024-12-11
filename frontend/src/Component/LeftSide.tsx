import React, { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import { useNavigate } from "react-router-dom";
import jwt from "jsonwebtoken";
import Cookies from "js-cookie";
import SearchIcon from "@mui/icons-material/Search";

interface User {
  _id: string;
  username: string;
  email: string;
}

const LeftSide: React.FC = () => {
  const navigate = useNavigate();
  const { userdata, setSelectedUser } = useUser();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userdata) {
      // console.log(userdata, "ahkfhhdfdsfbjsdfjsdf");
      setLoading(false); // Set loading false when userdata is fetched
    }
  }, [userdata]);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      const decoded = jwt.decode(token) as { userId: string } | null;
      if (decoded) {
        setCurrentUserId(decoded.userId);
      }
    }
  }, []);

  const getNameFromEmail = (email: string) => {
    return email.split("@")[0];
  };

  const handleUserClick = (id: string) => {
    const selectedUser = userdata && userdata._id === id ? userdata : null;

    if (selectedUser) {
      setSelectedUser(selectedUser);
      setSelectedUserId(id);
    }
  };

  const getUserColor = (id: string) => {
    const hash = id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `hsl(${hash % 360}, 70%, 80%)`;
  };

  // If userdata is an object, it should be displayed as a single user
  const filteredUsers =
    userdata && searchQuery
      ? userdata.username.toLowerCase().includes(searchQuery.toLowerCase())
        ? [userdata] // Wrap userdata in an array for rendering
        : []
      : [userdata];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "20px",
        minHeight: "10vh",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "fixed",
          width: "27%",
          top: "55px",
          padding: "10px",
          margin: "10px",
          backgroundColor: "#f9f9f9",
          borderBottom: "1px solid #ddd",
          zIndex: 1000
        }}
      >
        {/* Search Bar */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center"
          }}
        >
          <SearchIcon style={{ color: "#888", marginRight: "8px" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users"
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "20px",
              border: "1px solid #ddd",
              outline: "none"
            }}
          />
        </div>

        {/* User Profile */}
        {currentUserId && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              paddingLeft: "20px"
            }}
          >
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                backgroundColor: getUserColor(currentUserId),
                marginRight: "15px"
              }}
            ></div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                {userdata?.username}
              </div>
              <div style={{ fontSize: "12px", color: "#888" }}>Online</div>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          // background: "#fff",
          padding: "10px",
          borderRadius: "10px"
          // boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            paddingTop: "35px",
            gap: "10px"
          }}
        >
          {loading ? (
            <div
              style={{ textAlign: "center", padding: "20px", color: "#888" }}
            >
              Loading users...
            </div>
          ) : Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
            filteredUsers.map((user) =>
              user ? (
                <div
                  key={user._id}
                  onClick={() => handleUserClick(user._id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px",
                    backgroundColor: "#f1f1f191",
                    marginTop: "20px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                    border:
                      selectedUserId === user._id ? "2px solid #007bff" : "none"
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: getUserColor(user._id),
                      marginRight: "10px"
                    }}
                  ></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                      {user.username}
                    </div>
                    <div style={{ fontSize: "12px", color: "#888" }}>
                      Active User
                    </div>
                  </div>
                </div>
              ) : null
            )
          ) : (
            <div
              style={{ textAlign: "center", padding: "20px", color: "#888" }}
            >
              {Array.isArray(filteredUsers) && filteredUsers.length === 0
                ? "No users found."
                : "Loading users..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftSide;
