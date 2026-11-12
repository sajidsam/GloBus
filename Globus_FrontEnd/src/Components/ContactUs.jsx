import React, { useState, useEffect, useRef } from "react";
import {
  FaHome,
  FaCommentDots,
  FaQuestionCircle,
  FaMicrophone,
} from "react-icons/fa";
import { FaCircleChevronRight } from "react-icons/fa6";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase.config";
import { Link } from "react-router-dom";

const renderMessage = (text) => {
  // Regex to match [text](url)
  const parts = text.split(/(\[.*?\]\(.*?\))/g);
  return parts.map((part, index) => {
    const match = part.match(/\[(.*?)\]\((.*?)\)/);
    if (match) {
      return (
        <Link
          key={index}
          to={match[2]}
          className="text-blue-500 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          {match[1]}
        </Link>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

const ContactUs = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  const handleToggle = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserName(user ? user.displayName || "User" : "");
    });
    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    if (message.trim() === "") return;

    const userMessage = message;
    setMessages((prev) => [...prev, { text: userMessage, from: "user" }]);
    setMessage("");
    setIsTyping(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      setIsTyping(false);

      if (response.ok) {
        setMessages((prev) => [...prev, { text: data.reply, from: "bot" }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { text: data.error || "দুঃখিত, কোনো সমস্যা হয়েছে।", from: "bot" },
        ]);
      }
    } catch (error) {
      console.error("Chat API error:", error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { text: "নেটওয়ার্ক সমস্যা। দয়া করে আবার চেষ্টা করুন।", from: "bot" },
      ]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "bn-BD";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setMessage(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
    } else {
      console.warn("Speech Recognition not supported in this browser.");
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current)
      return alert("Speech recognition not supported!");

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.lang = "bn-BD";
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-20 right-2 sm:right-6 md:right-10 w-[calc(100vw-16px)] sm:w-80 h-[55vh] sm:h-[420px] md:h-[500px] max-h-[480px] z-50 rounded-2xl shadow-2xl bg-white dark:bg-gray-800 border dark:border-gray-700 flex flex-col overflow-hidden transition-all">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-4 py-3 flex items-center justify-between">
            <span className="font-semibold">GloBus Support</span>
            <button
              onClick={handleToggle}
              className="text-gray-300 hover:text-white text-lg font-bold"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 dark:bg-gray-900 flex flex-col gap-2">
            <p className="text text-gray-600 dark:text-gray-400">
              Hello {userName || "Guest"}!
            </p>

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`px-3 py-2 rounded-lg text-sm ${
                  msg.from === "user"
                    ? "bg-gray-800 text-white self-end max-w-[70%] dark:bg-gray-700"
                    : "bg-gray-200 text-gray-800 dark:text-gray-200 self-start max-w-[70%] dark:bg-gray-800 dark:text-gray-200"
                }`}
              >
                {renderMessage(msg.text)}
              </div>
            ))}

            {isTyping && (
              <div className="px-3 py-2 rounded-lg self-start max-w-[60%] flex justify-center">
                <span className="flex gap-2">
                  <span className="dot animate-bounce bg-black"></span>
                  <span className="dot animate-bounce delay-150 bg-black"></span>
                  <span className="dot animate-bounce delay-300 bg-black"></span>
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center p-2 bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 rounded-t-2xl border-t dark:border-gray-700">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type or speak..."
              className="border-none outline-none rounded-2xl px-3 py-2 mx-3 text-black dark:text-white bg-white dark:bg-gray-800 dark:bg-gray-700 flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={toggleRecording}
              className={`text-2xl mr-3 transition-colors ${
                isRecording
                  ? "text-red-500"
                  : "text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
              }`}
            >
              <FaMicrophone />
            </button>
            <button
              onClick={handleSend}
              className="bg-transparent text-gray-800 dark:text-gray-200 mr-3 text-2xl hover:text-black dark:hover:text-white"
            >
              <FaCircleChevronRight />
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 flex justify-around py-2 border-t dark:border-gray-700">
            <button className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
              <FaHome className="mb-1" />
              Home
            </button>
            <button className="flex flex-col items-center text-gray-500 hover:text-blue-600 text-sm relative">
              <FaCommentDots className="mb-1" />
              Messages
            </button>
            <button className="flex flex-col items-center text-gray-500 hover:text-blue-600 text-sm">
              <FaQuestionCircle className="mb-1" />
              Help
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleToggle}
        className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 md:bottom-10 md:right-10 z-50 bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-full shadow-lg hover:bg-blue-700"
      >
        {isOpen ? "Close Chat" : "Contact Us"}
      </button>
    </>
  );
};

export default ContactUs;
