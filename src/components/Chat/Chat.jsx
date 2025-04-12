import { useState, useEffect, useRef } from "react";
import { FiUser } from "react-icons/fi";
import { TbRobot } from "react-icons/tb";
import DOMPurify from "dompurify";

const API_URL = import.meta.env.VITE_BACKEND_API;

import "./Chat.css";
import "./Chat-mobile.css";

import {
  handleSendMessage,
  fetchAndConvertImageOnMount,
  parseChatbotResponse,
} from "./chatHelpers";

import useChatStream from "../../../hooks/Chat/useChatStream";
import useWindowSize from "../../../hooks/useWindowSize";

export default function Chat({
  articleTitle,
  articleDescription,
  articleImage,
  articleToc,
  articleUrl,
  selectedSource,
  selectedLang,
}) {
  const { sendChatMessage, loading: streamLoading } = useChatStream(API_URL);
  const { width } = useWindowSize();

  const chatLogRef = useRef(null);
  const inputRef = useRef(null);

  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageAllowed, setImageAllowed] = useState(
    selectedSource.startsWith("Wikimedia")
  );
  const [imageToggleVisible, setImageToggleVisible] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [botThinking, setBotThinking] = useState(false);
  const [placeholderText, setPlaceholderText] = useState(
    `Ask anything about ${articleTitle}`
  );
  const [titleText, setTitleText] = useState(
    `Type your question about ${articleTitle} in this field`
  );

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const onSendMessage = () =>
    handleSendMessage({
      userInput,
      chatMessages,
      setChatMessages,
      setUserInput,
      setLoading,
      setPlaceholderText,
      setTitleText,
      setBotThinking,
      sendChatMessage,
      articleImage,
      imageAllowed,
      setImageToggleVisible,
      setMessageCount,
      articleTitle,
      articleDescription,
      articleToc,
      articleUrl,
      selectedLang,
    });

  useEffect(() => {
    fetchAndConvertImageOnMount(articleImage, setImageToggleVisible);
  }, [articleImage]);

  useEffect(() => {
    if (streamLoading) {
      setPlaceholderText("Bot is responding...");
    } else if (!loading && !streamLoading) {
      setPlaceholderText(`Ask anything about ${articleTitle}`);
    }
  }, [streamLoading, loading, articleTitle]);

  return (
    <>
      <h2
        style={{
          display: width < 900 ? "none" : "block",
          cursor: botThinking && "progress",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          paddingBottom: "10px",
        }}
        aria-hidden
      >
        {articleTitle}
      </h2>

      <div
        ref={chatLogRef}
        className="chat-log"
        style={{ cursor: botThinking && "progress" }}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Chat conversation log between the user and the chatbot"
      >
        <div role="list">
          {chatMessages
            .filter((msg) => msg.sender !== "system")
            .map((msg, idx) => (
              <div
                key={idx}
                className={`chat-message ${msg.sender}`}
                aria-label={
                  msg.sender === "user" ? "User message" : "Bot message"
                }
                role="listitem"
              >
                {msg.sender === "user" ? (
                  <FiUser
                    className="chat-message-icons user-icon"
                    size="1.05rem"
                    aria-hidden
                  />
                ) : (
                  <TbRobot
                    className="chat-message-icons bot-icon"
                    size="1.2rem"
                    aria-hidden
                  />
                )}{" "}
                {msg.sender === "bot" ? (
                  <span
                    aria-disabled={botThinking}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        parseChatbotResponse(msg.text),
                        {
                          ADD_ATTR: ["target"],
                        }
                      ),
                    }}
                  />
                ) : (
                  <span>{msg.text}</span>
                )}
              </div>
            ))}
        </div>
      </div>

      <input
        type="text"
        ref={inputRef}
        placeholder={placeholderText}
        className="chat-input-area"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSendMessage();
            setUserInput("");
          }
        }}
        disabled={loading || streamLoading}
        style={{
          opacity: loading || streamLoading ? "0.5" : "1",
          cursor: loading || streamLoading ? "not-allowed" : "auto",
        }}
        autoFocus
        required
        inputMode="text"
        spellCheck
        autoCapitalize="sentences"
        tabIndex={0}
        minLength="1"
        maxLength="200"
        title={titleText}
        aria-label={`Type your question about ${articleTitle} to the chatbot in this field and then press enter once you're done.`}
      />

      <div
        className="prompt-count"
        style={{
          display: loading || streamLoading ? "none" : "block",
          cursor: loading || streamLoading ? "not-allowed" : "auto",
        }}
        title={`You have ${20 - messageCount} prompts left`}
        aria-label={`You have ${20 - messageCount} prompts left`}
      >
        {20 - messageCount}
      </div>

      {imageToggleVisible && chatMessages.length === 0 && (
        <button
          onClick={() => {
            setImageAllowed((prev) => !prev);
            inputRef.current?.focus();
          }}
          className="image-toggle-button"
          aria-label={
            imageAllowed
              ? "Click to stop sending image with your question to the chatbot (faster response time)"
              : "Click to send image with your question to the chatbot (slower response time)"
          }
          aria-pressed={imageAllowed}
        >
          {imageAllowed
            ? "Don't send image to chatbot"
            : "Send image to chatbot?"}
          <i>
            {imageAllowed
              ? " (faster, lower chance of errors)"
              : " (slower, still in development)"}
          </i>
        </button>
      )}
    </>
  );
}
