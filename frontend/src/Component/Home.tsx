import React from "react";
import Chat from "./Chat";
import Navbar from "./Navigation";

const Home = () => {
  const userId = "user1"; // Replace with dynamic user ID from authentication or context
  const toUserId = "user2"; // The ID of the user to communicate with

  return (
    <div>
      <Navbar />
      <Chat />
      {/* <Chat userId={userId} toUserId={toUserId} /> */}
    </div>
  );
};

export default Home;
