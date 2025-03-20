import { useState, useEffect, useRef } from "react";

import wtf from "wtf_wikipedia";

import { FiUser } from "react-icons/fi";
import { TbRobot } from "react-icons/tb";

import "./Chat.css";
import "./Chat-mobile.css";

export default function Chat({ articleTitle, articleDescription, articleToc }) {
  const [articleWikitext, setArticleWikitext] = useState("");
  const [articleJSON, setArticleJSON] = useState("");
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
  const inputRef = useRef(null);

  useEffect(() => {
    async function fetchArticleContent() {
      try {
        const doc = await wtf.fetch(articleTitle, "en");
        setArticleWikitext(doc.wikitext());
        setArticleJSON(doc.json());
      } catch (error) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Sorry, looks like there's a problem right now. Please try again later.",
          },
        ]);
        setPlaceholderText(`Uh oh!`);
        setTitleText(error);
        setLoading(true);
      }
      setPlaceholderText(`Ask anything about ${articleTitle}`);
      setTitleText(`Type your question about ${articleTitle} in this field`);

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
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
<p>Article Wikitext: ${articleWikitext}</p>
<p>Article JSON: ${articleJSON}</p>

INSTRUCTIONS:
You are communicating with the user on a website called wikiarticles. Your goal is to provide factual information about the subject of the given Wikipedia article in a friendly tone. Follow these rules precisely:

1. **Response Format:**  
   - Respond in TEXT ONLY (no HTML).  
   - Use custom formatting: *word* for italics and **word** for bold. Only use bolded words for headings, not hashtags.
   - For bullet lists, start each item on a new line with "- ". For numbered lists, use "1) ", "2) ", etc.
   - Keep every response under 150 words.

2. **Content Boundaries:**  
   - Do not reveal any details about the article unless the user explicitly asks.
   - When the question goes beyond the article data, use your pre-existing knowledge while adhering to these rules.

3. **Handling Data Types:**  
   - If the article data includes tables, lists, images, or references, convert them into clear bullet or numbered lists as needed.

4. **Links:**  
   - Always display links using the exact format:  
     "|display text__(websitelink)|"
   - Use only the links provided from the article data; do not generate or hallucinate new URLs.
   - Integrate links naturally within the text following the formatting rules.

Now, please answer the following user query:
  `;
  };

  function parseCustomFormatting(text) {
    let output = text;

    output = output.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    output = output.replace(/\*(.*?)\*/g, "<em>$1</em>");

    output = output.replace(
      /\|([^|]+?)__([^|]+?)\|/g,
      (match, displayText, websiteLink) => {
        let finalLink = websiteLink;
        if (!websiteLink.startsWith("http")) {
          finalLink = "https://" + websiteLink;
        }
        return `<a href="${finalLink}" aria-label="Open ${finalLink} in a new tab" class="chat-message-link" target="_blank" rel="noopener noreferrer">${displayText}</a>`;
      }
    );

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
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }, 50);
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
      setPlaceholderText(`Uh oh!`);
      setTitleText(error);
      setLoading(true);
    } finally {
      setMessageCount((prevCount) => {
        const newCount = prevCount + 1;
        if (newCount > 19) {
          setPlaceholderText(
            "You have exceeded the 20 prompts limit, try again later."
          );
          setTitleText("Close and reopen the chat to ask more questions.");
          setLoading(true);
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
                  size="1.05rem"
                  style={{
                    top: window.innerWidth < 900 ? "1.4px" : "3px",
                    marginRight: window.innerWidth < 900 ? "10px" : "12px",
                    marginLeft: "1px",
                  }}
                />
              ) : (
                <TbRobot
                  className="chat-message-icons"
                  size="1.2rem"
                  style={{
                    top: window.innerWidth < 900 ? "2px" : "2px",
                    marginRight: window.innerWidth < 900 ? "8px" : "11px",
                  }}
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
        style={{ display: loading && "none" }}
        title={`You have ${20 - messageCount} prompts left`}
        aria-label={`You have ${20 - messageCount} prompts left`}
      >
        {20 - messageCount}
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
            handleSendMessage();
            setUserInput("");
          }
        }}
        disabled={loading}
        style={{ opacity: loading && "0.5" }}
        autoFocus
        maxLength="250"
        title={titleText}
        aria-label={`Type your question about ${articleTitle} to the chatbot in this field`}
      />
    </>
  );
}
