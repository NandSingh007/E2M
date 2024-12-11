import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { FaEye, FaEyeSlash, FaCheck } from "react-icons/fa";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import socket from "../socketConnection/Socket";

const Registration = () => {
  const navigate = useNavigate();
  interface Data {
    username: string;
    password: string;
  }

  const [registration, setRegistration] = useState<Data>({
    username: "",
    password: ""
  });
  const [login, setLogin] = useState<Data>({
    username: "",
    password: ""
  });
  const [isLogin, setIsLogin] = useState(false); // State to toggle between login and register
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  useEffect(() => {
    socket.connect();
    const token = Cookies.get("token");
    if (token) {
      navigate("/");
    }
  }, []);

  // Toggle between login and register
  const handleToggleForm = () => {
    setIsLogin((prev) => !prev);
  };

  // Handle input changes
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogin({ ...login, [e.target.name]: e.target.value });
  };
  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegistration({ ...registration, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (isLogin) {
      // **Login Process**

      // Check if login fields are empty
      if (!login.username || !login.password) {
        Swal.fire({
          title: "Error",
          text: "Please fill out both username and password fields.",
          icon: "error",
          confirmButtonText: "Okay"
        });
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(login)
        });

        if (response.ok) {
          const data = await response.json();
          const token = data.token;

          // Store the token in cookies (expires in 2 days)
          Cookies.set("token", token, { expires: 2 });
          socket.emit("user-Register", token);
          // Show success message for login
          Swal.fire({
            title: "Login Successful",
            text: `Welcome, ${login.username}`,
            icon: "success",
            confirmButtonText: "Okay"
          }).then(() => {
            // Redirect to the home page after successful login and confirmation
            navigate("/");
          });
        } else {
          // Handle login failure
          Swal.fire({
            title: "Error",
            text: "Invalid username or password. Please try again.",
            icon: "error",
            confirmButtonText: "Try Again"
          });
        }
      } catch (error) {
        // Handle network or other errors during login
        Swal.fire({
          title: "Error",
          text: "An error occurred during login. Please check your network connection.",
          icon: "error",
          confirmButtonText: "Try Again"
        });
      }
    } else {
      // **Registration Process**

      // Check if registration fields are empty
      if (!registration.username || !registration.password) {
        Swal.fire({
          title: "Error",
          text: "Please fill out all fields (username, password, and confirm password).",
          icon: "error",
          confirmButtonText: "Okay"
        });
        return;
      }

      try {
        // Send registration data to the server
        console.log(registration);
        const response = await fetch(`http://localhost:5000/registration`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(registration),
          credentials: "include" // This ensures cookies are sent/received
        });

        if (response.ok) {
          // Show success message for registration
          Swal.fire({
            title: "Registration Successful",
            text: `username: ${registration.username}`,
            icon: "success",
            confirmButtonText: "Okay"
          });

          // Clear registration fields
          setRegistration({
            username: "",
            password: ""
          });
          setIsLogin(true); // Switch to login view
        } else {
          // Handle registration failure
          Swal.fire({
            title: "Error",
            text: "There was an issue with registration. Please try again.",
            icon: "error",
            confirmButtonText: "Try Again"
          });
        }
      } catch (error) {
        // Handle network or other errors during registration
        Swal.fire({
          title: "Error",
          text: "An error occurred during registration. Please check your network connection.",
          icon: "error",
          confirmButtonText: "Try Again"
        });
      }
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  return (
    <Container>
      <ChatBox>
        <Title>
          {isLogin ? "Login" : "Register"} <Smiley>🙂</Smiley>
        </Title>

        <InputContainer>
          <Label>username</Label>
          <Input
            type="text"
            name="username"
            onChange={isLogin ? handleLoginChange : handleRegistrationChange}
            value={isLogin ? login.username : registration.username}
            placeholder="Enter your username"
          />
        </InputContainer>

        <InputContainer>
          <Label>Password</Label>
          <PasswordWrapper>
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              onChange={isLogin ? handleLoginChange : handleRegistrationChange}
              value={isLogin ? login.password : registration.password}
              placeholder={
                isLogin ? "Enter your password" : "Create a password"
              }
            />
            <Icon onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </Icon>
          </PasswordWrapper>
        </InputContainer>

        <Button onClick={handleSubmit}>{isLogin ? "Login" : "Register"}</Button>

        <Footer>
          <p>
            {isLogin ? (
              <span>
                Don't have an account?{" "}
                <ToggleLink onClick={handleToggleForm}>Register</ToggleLink>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <ToggleLink onClick={handleToggleForm}>Login</ToggleLink>
              </span>
            )}
          </p>
        </Footer>
      </ChatBox>
    </Container>
  );
};

export default Registration;

// Styled-components for styling
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background: #e4f1f1;
  margin: 0;
  overflow: hidden;
  padding: 0;
`;

const ChatBox = styled.div`
  background-color: #ffffff;
  padding: 30px 40px;
  border-radius: 15px;
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
  backdrop-filter: blur(10px);
  box-sizing: border-box;
  animation: fadeIn 0.6s ease-in-out; /* Apply fade-in animation */

  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #075e54;
  margin-bottom: 25px;
  font-family: "Poppins", sans-serif;
  font-weight: bold;
`;

const Smiley = styled.span`
  font-size: 2.5rem;
  color: #25d366;
`;

const InputContainer = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 1rem;
  color: #555555;
  margin-bottom: 8px;
  font-family: "Roboto", sans-serif;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 20px;
  border: 2px solid #cccccc;
  border-radius: 10px;
  font-size: 1.1rem;
  outline: none;
  transition: all 0.3s ease;
  font-family: "Poppins", sans-serif;
  box-sizing: border-box;
  margin: 0;

  &:focus {
    border-color: #25d366;
    box-shadow: 0px 0px 8px rgba(37, 211, 102, 0.5);
  }

  ::placeholder {
    color: #b0b0b0;
  }
`;

const Button = styled.button`
  background-color: #25d366;
  color: #ffffff;
  border: none;
  padding: 12px 20px;
  font-size: 1.1rem;
  border-radius: 15px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s ease, transform 0.2s ease;
  font-family: "Poppins", sans-serif;

  &:hover {
    background-color: #128c7e;
    transform: scale(1.05);
  }

  &:active {
    background-color: #075e54;
  }
`;

const Footer = styled.div`
  margin-top: 20px;
  font-size: 0.9rem;
  color: #666666;
  font-family: "Roboto", sans-serif;
`;

const ToggleLink = styled.span`
  color: #075e54;
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const PasswordWrapper = styled.div`
  position: relative;
`;

const Icon = styled.span`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #888;
`;

const MatchIcon = styled.span`
  position: absolute;
  right: 40px; /* Adjusted to avoid overlapping with the eye icon */
  top: 50%;
  transform: translateY(-50%);
`;
