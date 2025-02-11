import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase/client";
import {
  collection,
  addDoc,
  where,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { X } from "lucide-react";

import "../tutor/style.css";

const Chat = ({ tutor, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatRoom = `chat_${auth.currentUser.uid}_${tutor.id}`;
  const messagesRef = collection(db, "messages");

  useEffect(() => {
    const q = query(messagesRef, where("room", "==", chatRoom), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let loadedMessages = [];
      snapshot.forEach((doc) => loadedMessages.push({ ...doc.data(), id: doc.id }));
      setMessages(loadedMessages);
    });

    return () => unsubscribe();
  }, [chatRoom]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName,
      tutorId: tutor.id,
      tutorName: `${tutor.firstName} ${tutor.lastName}`,
      room: chatRoom,
    });

    setNewMessage("");
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h2>Chat with {tutor.firstName} {tutor.lastName}</h2>
        <button className="close-button" onClick={onClose}><X size={24} /></button>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-bubble ${msg.userId === auth.currentUser.uid ? "sent" : "received"}`}>
            <span className="chat-user">{msg.userName}:</span> {msg.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="chat-form">
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
