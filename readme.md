# E2M Solutions Assignment

This project is a simulation of a live chat application with OpenAI integration.

The assignment involves two main folders:

- **Frontend**: Built with **React.js** and **TypeScript**
- **Backend**: Built with **Node.js**, **Express.js**, and **TypeScript**

## Features

1. **Chat Creation**:
    - New Chat Button
    - Option to invite members via a modal or dropdown
    - Users can be invited to chats using their usernames

2. **Real-time Chat with WebSocket**:
    - A WebSocket server is set up (using **Socket.IO** or native WebSocket)
    - Real-time communication is established, ensuring all connected clients can send and receive messages simultaneously

3. **Chat Input and OpenAI API Integration**:
    - Users can input their messages
    - A send button allows users to submit messages
    - On message submission, an API call is triggered to **OpenAI** with the user’s input
    - The response from OpenAI is streamed back to the chat interface using WebSocket and formatted in Markdown

4. **Scaling WebSocket Server**:
    - Backend is scaled using **Node.js** with **Express**, with **cluster** for load balancing
    - Multiple backend servers listen to the same socket events to handle high traffic

5. **Redis Integration**:
    - Chat data is stored using **Redis** as a key-value store to persist chat information

---

## Setup Instructions

### 1. Backend Setup

- **Install dependencies**:

    ```bash
    cd backend
    npm install
    ```

- **Start the backend server**:

    ```bash
    npm run dev
    ```

    This will start the server in development mode. The server is configured to use **Cluster** for load balancing and **Redis** to store chat data as key-value pairs.

### 2. Frontend Setup

- **Install dependencies**:

    ```bash
    cd frontend
    npm install
    ```

- **Start the frontend application**:

    ```bash
    npm run start
    ```

    This will run the frontend React application, which is built using **React.js** and **TypeScript**.

---

## Backend Details

- **Cluster Setup**:  
   I used **Node.js Cluster** to balance the workload across multiple backend servers, ensuring efficient handling of concurrent requests.

- **Redis for Chat Data**:  
   The chat messages are stored in **Redis** in the form of key-value pairs. Each chat is assigned a unique key, and its messages are stored as a list in Redis.

- **WebSocket Integration**:  
   I implemented **Socket.IO** (or native WebSocket) to enable real-time communication between the frontend and backend. This allows messages to be sent and received in real-time without refreshing the page.

---

## Future Improvements

- **Authentication**:  
   Adding user authentication to manage user sessions and data security.

- **Database Integration**:  
   Storing user data and chat history in a relational or NoSQL database for persistence.

- **UI/UX Enhancements**:  
   Improving the user interface to make the chat experience more intuitive and visually appealing.

---

## Conclusion

This project demonstrates how to build a scalable, real-time chat application with integration to **OpenAI** for generating intelligent responses. By leveraging **Node.js**, **Express**, **WebSocket**, and **Redis**, the app provides seamless, interactive communication for users.
