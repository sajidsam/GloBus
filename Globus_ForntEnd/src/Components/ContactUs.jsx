import React, { useState, useEffect, useRef } from "react";
import { FaHome, FaCommentDots, FaQuestionCircle, FaMicrophone } from "react-icons/fa";
import { FaCircleChevronRight } from "react-icons/fa6";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserName(user ? user.displayName || "User" : "");
    });
    return () => unsubscribe();
  }, []);

  const handleSend = () => {
    if (message.trim() === "") return;

    setMessages((prev) => [...prev, { text: message, from: "user" }]);
    setMessage("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          text: "দুঃখিত, কিছু সময়ের জন্য আমাদের অনলাইন সাপোর্ট বন্ধ আছে।",
          from: "bot",
        },
      ]);
    }, 1500);
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
    if (!recognitionRef.current) return alert("Speech recognition not supported!");

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
        <div className="fixed bottom-24 right-10 w-80 h-[500px] rounded-2xl shadow-2xl bg-white flex flex-col overflow-hidden transition-all">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-4 py-3 flex items-center justify-between">
            <span className="font-semibold">GloBus Support</span>
            <button
              onClick={handleToggle}
              className="text-gray-300 hover:text-white text-lg font-bold"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-2">
            <p className="text text-gray-600">Hello {userName || "Guest"}!</p>

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`px-3 py-2 rounded-lg text-sm ${
                  msg.from === "user"
                    ? "bg-gray-800 text-white self-end max-w-[70%]"
                    : "bg-gray-200 text-gray-800 self-start max-w-[70%]"
                }`}
              >
                {msg.text}
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

          <div className="flex items-center p-2 bg-gray-100 rounded-t-2xl ">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type or speak..."
              className="border-none outline-none rounded-2xl px-3 py-2 mx-3 text-black flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={toggleRecording}
              className={`text-2xl mr-3 transition-colors ${
                isRecording ? "text-red-500" : "text-gray-700 hover:text-black"
              }`}
            >
              <FaMicrophone />
            </button>
            <button
              onClick={handleSend}
              className="bg-white text-black mr-3 text-2xl"
            >
              <FaCircleChevronRight />
            </button>
          </div>

          <div className="bg-white flex justify-around py-2">
            <button className="flex flex-col items-center text-gray-500 hover:text-blue-600 text-sm">
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
        className="fixed bottom-10 right-10 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700"
      >
        {isOpen ? "Close Chat" : "Contact Us"}
      </button>
    </>
  );
};

export default ContactUs;
