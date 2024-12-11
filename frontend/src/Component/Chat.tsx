import React from "react";
import LeftSide from "./LeftSide";
import RightSide from "./RightSide";
import { UserProvider } from "./UserContext";

// The styles will be applied globally by adding to the head of the document
const hideScrollbarStyle = {
  overflowY: "scroll" // Allow scrolling
};

const Chat = () => {
  return (
    <>
      <UserProvider>
        <div
          style={{
            display: "flex",
            height: "90vh", // Make the container fill the full height of the viewport
            margin: "0px",
            padding: "0px"
          }}
        >
          <div
            style={{
              width: "30%",
              marginLeft: "0px",
              height: "90vh", // Full height for the left side
              overflowY: "scroll", // Allow scrolling
              WebkitOverflowScrolling: "touch" // Optional for smooth scrolling on mobile devices
            }}
            className="hide-scrollbar"
          >
            <LeftSide />
          </div>
          <div
            style={{
              width: "70%",
              height: "90vh", // Full height for the right side
              textAlign: "center"
            }}
          >
            <RightSide />
          </div>
        </div>
      </UserProvider>

      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {
            display: none; /* Hide the scrollbar */
          }
          .hide-scrollbar {
            -ms-overflow-style: none; /* For Internet Explorer 10+ */
            scrollbar-width: none; /* For Firefox */
          }
        `}
      </style>
    </>
  );
};

export default Chat;
