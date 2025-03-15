import { useState, useEffect, useRef } from "react";

import wtf from "wtf_wikipedia";

import { FiUser } from "react-icons/fi";
import { SiGooglegemini } from "react-icons/si";

import "./Chat.css";
import "./Chat-mobile.css";

export default function Chat({ articleTitle, articleDescription, articleToc }) {
  const [articleContent, setArticleContent] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [placeholderText, setPlaceholderText] = useState(
    `Ask anything about ${articleTitle}`
  );
  const [titleText, setTitleText] = useState(
    `Type your question about ${articleTitle} in this field`
  );

  const chatLogRef = useRef(null);

  useEffect(() => {
    async function fetchArticleContent() {
      try {
        const doc = await wtf.fetch(articleTitle, "en");
        const content = doc.text();
        setArticleContent(content);
      } catch (error) {
        setPlaceholderText(
          "We couldn't fetch the article details, please try again later."
        );
        console.error("Error fetching article content:", error);
      }
    }
    fetchArticleContent();
  }, [articleTitle]);

  const capitalizeFirstLetter = (inputValue) => {
    if (inputValue) {
      return inputValue.charAt(0).toUpperCase() + inputValue.slice(1);
    }
    return inputValue;
  };

  const getSystemPrompt = () => {
    return `
  ARTICLE CONTENT:
  <h1>${articleTitle}</h1>
  <p>${articleDescription}</p>
  <p>Table of Contents: ${articleToc}</p>
  <p>Article Content: ${articleContent}</p>
  INSTRUCTIONS:
  You are communicating with the user on a website called wikiarticles. Your goal is to provide factual information regarding the subject of the given article.
  - Respond in TEXT ONLY (no HTML).
  - Use the following custom formatting:
    - *word* for italics
    - **word** for bold
    - When listing items in the format "subject: subject details", bold the subject (ex. **subject**: subject details)
    - For bullet lists, start each item on a new line with '- '
    - For numbered lists, start each item on a new line with '1) ', '2) ', etc.
  Do not start with any greetings or introductions.
  Ensure your response is strictly under 130 words.
  You should answer questions not directly related to the subject of the article.
  You should answer questions (even if the answer is not mentioned in the article) using your pre-existing knowledge database.
  Now, please answer the following user query:
    `;
  };

  function parseCustomFormatting(text) {
    let output = text;

    output = output.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    output = output.replace(/\*(.*?)\*/g, "<em>$1</em>");

    const lines = output.split("\n");
    let inUl = false;
    let inOl = false;
    let finalLines = [];

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith("- ")) {
        if (!inUl) {
          finalLines.push("<ul>");
          inUl = true;
        }
        finalLines.push("<li>" + trimmedLine.slice(2) + "</li>");
      } else {
        if (inUl) {
          finalLines.push("</ul>");
          inUl = false;
        }

        const numberedMatch = trimmedLine.match(/^(\d+)\)\s+(.*)$/);
        if (numberedMatch) {
          if (!inOl) {
            finalLines.push("<ol>");
            inOl = true;
          }
          finalLines.push("<li>" + numberedMatch[2] + "</li>");
        } else {
          if (inOl) {
            finalLines.push("</ol>");
            inOl = false;
          }
          finalLines.push(line);
        }
      }
    });

    if (inUl) finalLines.push("</ul>");
    if (inOl) finalLines.push("</ol>");

    return finalLines.join("\n");
  }

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const capitalizedInput = capitalizeFirstLetter(userInput);

    let updatedChatMessages;
    if (chatMessages.length === 0) {
      updatedChatMessages = [
        { sender: "system", text: getSystemPrompt() },
        { sender: "user", text: capitalizedInput },
      ];
    } else {
      updatedChatMessages = [
        ...chatMessages,
        { sender: "user", text: capitalizedInput },
      ];
    }

    setChatMessages(updatedChatMessages);
    setUserInput("");
    setLoading(true);
    setPlaceholderText("Bot is responding...");
    setTitleText(
      "Please wait for the bot to finish responding, it's rude to interrupt!"
    );

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatHistory: updatedChatMessages }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessage = "";

      const botPlaceholderMessage = { sender: "bot", text: "..." };
      const updatedChatMessagesWithBot = [
        ...updatedChatMessages,
        botPlaceholderMessage,
      ];
      setChatMessages(updatedChatMessagesWithBot);

      const processStream = async () => {
        const { done, value } = await reader.read();
        if (done) {
          setLoading(false);
          setPlaceholderText(`Ask anything about ${articleTitle}`);
          setTitleText(
            `Type your question about ${articleTitle} in this field`
          );
          if (chatLogRef.current) {
            const lastMessage = chatLogRef.current.querySelector(
              ".chat-message:last-child"
            );
            if (lastMessage) {
              lastMessage.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
          }
          return;
        }

        const chunkText = decoder.decode(value, { stream: true });
        const words = chunkText.split(" ");

        for (let word of words) {
          botMessage += word + " ";
          setChatMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              sender: "bot",
              text: botMessage,
            };
            return newMessages;
          });
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        processStream();
      };

      processStream();
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, looks like there's a problem right now. Please try again later.",
        },
      ]);
    } finally {
      setMessageCount((prevCount) => {
        const newCount = prevCount + 1;
        if (newCount > 30) {
          setPlaceholderText(
            "You have exceeded the 30 prompts limit, try again later."
          );
          setTitleText("Close and reopen the chat to ask more questions.");
        }
        return newCount;
      });
    }
  };

  return (
    <>
      <h2
        style={{
          display: window.innerWidth < 900 ? "none" : "block",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          paddingBottom: "10px",
        }}
      >
        {articleTitle}
      </h2>
      <div className="chat-log" ref={chatLogRef}>
        {chatMessages
          .filter((msg) => msg.sender !== "system")
          .map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.sender}`}>
              {msg.sender === "user" ? (
                <FiUser
                  className="chat-message-icons"
                  style={{ top: window.innerWidth < 900 ? "2.42px" : "4px" }}
                />
              ) : (
                <SiGooglegemini
                  className="chat-message-icons"
                  style={{ top: window.innerWidth < 900 ? "2.4px" : "4.5px" }}
                />
              )}{" "}
              {msg.sender === "bot" ? (
                <span
                  style={{ fontWeight: "400" }}
                  dangerouslySetInnerHTML={{
                    __html: parseCustomFormatting(msg.text),
                  }}
                />
              ) : (
                <span style={{ fontWeight: "400" }}>{msg.text}</span>
              )}
            </div>
          ))}
      </div>

      <div
        className="prompt-count"
        title={`You have ${30 - messageCount} prompts left`}
        aria-label={`You have ${30 - messageCount} prompts left`}
      >
        {30 - messageCount}
      </div>

      <input
        type="text"
        placeholder={placeholderText}
        className="chat-input-area"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSendMessage();
            setUserInput("");
          }
        }}
        disabled={loading}
        autoFocus
        maxLength="250"
        title={titleText}
        aria-label={`Type your question about ${articleTitle} to the chatbot in this field`}
      />
    </>
  );
}
