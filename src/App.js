import React, { useState, useEffect } from "react";
import axios from "axios";
import IconImage from "./icons/Display.svg";
import "./App.css";

const API_URL = "https://api.quicksell.co/v1/internal/frontend-assignment";
const priorityLabels = ["No Priority", "Low", "Medium", "High", "Urgent"];

function App() {
  const [tickets, setTickets] = useState([]);
  const [grouping, setGrouping] = useState(() => localStorage.getItem("grouping") || "Status");
  const [ordering, setOrdering] = useState(() => localStorage.getItem("ordering") || "Priority");
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    axios
      .get(API_URL)
      .then((response) => {
        const { tickets: apiTickets, users } = response.data;

        const ticketsWithUserNames = apiTickets.map((ticket) => {
          const user = users.find((user) => user.id === ticket.userId);
          return { ...ticket, user: user ? user.name : "Unassigned" };
        });

        setTickets(ticketsWithUserNames);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    localStorage.setItem("grouping", grouping);
    localStorage.setItem("ordering", ordering);
  }, [grouping, ordering]);

  const groupTickets = () => {
    const groups = {};
    tickets.forEach((ticket) => {
      const key =
        grouping === "Status"
          ? ticket.status
          : grouping === "User"
          ? ticket.user || "Unassigned"
          : priorityLabels[ticket.priority];
      if (!groups[key]) groups[key] = [];
      groups[key].push(ticket);
    });

    Object.values(groups).forEach((group) => {
      group.sort((a, b) => {
        if (ordering === "Priority") return b.priority - a.priority;
        if (ordering === "Title") return a.title.localeCompare(b.title);
        return 0;
      });
    });

    return groups;
  };

  const groupedTickets = groupTickets();

  return (
    <div className="app">
      {/* Header Section */}
      <header className="header">
        <button className="display-button" onClick={() => setShowControls(!showControls)}>
        <img src={IconImage} alt="Display Icon" className="display-icon" /> 
        <span className="display-text">Display</span>
        </button>

        
      <div className={`controls ${showControls ? "expanded" : ""}`}>
        <div className="control-item">
          <label>Grouping:</label>
          <select value={grouping} onChange={(e) => setGrouping(e.target.value)}>
            <option value="Status">Status</option>
            <option value="User">User</option>
            <option value="Priority">Priority</option>
          </select>
        </div>
        <div className="control-item">
          <label>Ordering:</label>
          <select value={ordering} onChange={(e) => setOrdering(e.target.value)}>
            <option value="Priority">Priority</option>
            <option value="Title">Title</option>
          </select>
        </div>
      </div>
      
      </header>

      {/* Main Section */}
      <main className="main">
        {/* Grouped Columns */}
        <div className="columns">
          {Object.entries(groupedTickets).map(([group, tickets]) => (
            <div className="column" key={group}>
              {/* Group Header */}
              <div className="column-header">
                <h2>{group}</h2>
                <div className="column-icons">
                  <button className="icon-button add-icon" title="Add Task">+</button>
                  <button className="icon-button menu-icon" title="More Options">...</button>
                </div>
              </div>

              {/* Task Cards */}
              <div className="column-cards">
                {tickets.map((ticket) => (
                  <div className="card" key={ticket.id}>
                    <div className="card-content">
                      <h3 className="card-title">{ticket.title}</h3>
                      <span className="card-priority">Priority: {ticket.priority}</span>
                      <p className="card-status">Status: {ticket.status}</p>
                      <p className="card-user">User: {ticket.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
