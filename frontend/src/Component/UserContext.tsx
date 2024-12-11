// UserContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect
} from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Define the User interface
interface User {
  _id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  password: string;
}

// Define the decoded token structure
interface DecodedToken {
  userId: string;
  // other properties in the token if necessary
}

// Define the context type
interface UserContextType {
  userdata: User | null; // Single user or null
  setUserdata: React.Dispatch<React.SetStateAction<User | null>>; // State setter for single user
  selectedUser: User | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
  currentUserId: string | null; // Current user ID extracted from token
}

// Define props for the UserProvider
interface UserProviderProps {
  children: ReactNode;
}

// Create the UserContext with an initial undefined value
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [userdata, setUserdata] = useState<User | null>(null); // Single user state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = Cookies.get("token");
        if (token) {
          const decoded = jwtDecode<DecodedToken>(token);
          setCurrentUserId(decoded.userId);
          const id = decoded.userId;

          const response = await fetch(
            "http://localhost:5000/user-collection",
            {
              headers: { authorization: `${id}` }
            }
          );

          if (response.ok) {
            const data = await response.json(); // Single object expected
            console.log("Fetched user data:", data);
            setUserdata(data); // Assign the fetched user object
          } else {
            navigate("/Registration");
          }
        } else {
          navigate("/Registration");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        navigate("/Registration");
      }
    };

    fetchUserData();
  }, [navigate]);

  return (
    <UserContext.Provider
      value={{
        userdata,
        setUserdata,
        selectedUser,
        setSelectedUser,
        currentUserId
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
