async function convertImageToBase64(url) {
  try {
    const response = await fetch(url, { mode: "cors" });
    const blob = await response.blob();

    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = URL.createObjectURL(blob);
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    return await new Promise((resolve) => {
      canvas.toBlob(
        (outputBlob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const fullBase64 = reader.result;
            resolve(fullBase64);
          };
          reader.readAsDataURL(outputBlob);
        },
        "image/webp",
        0.75
      );
    });
  } catch (err) {
    console.warn("Error in convertImageToBase64:", err);
    return null;
  }
}

export const fetchAndConvertImageOnMount = async (
  articleImage,
  setImageToggleVisible,
  setImageLoadingStatus
) => {
  if (!articleImage) {
    setImageLoadingStatus("error");
    return;
  }

  try {
    const base64 = await convertImageToBase64(articleImage);
    if (base64) {
      setImageToggleVisible(true);
      setImageLoadingStatus("success");
    } else {
      setImageToggleVisible(false);
      setImageLoadingStatus("error");
    }
  } catch (err) {
    console.error("Failed to prepare image for chatbot:", err);
    setImageToggleVisible(false);
    setImageLoadingStatus("error");
  }
};

export const handleSendMessage = async ({
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
}) => {
  if (!userInput.trim()) return;

  let updatedChatMessages;
  if (chatMessages.length === 0) {
    updatedChatMessages = [
      {
        sender: "system",
        text: `
  ARTICLE CONTENT:
  <h1>${articleTitle}</h1>
  <p>${articleDescription}</p>
  <p>Table of Contents: ${articleToc}</p>
  <p>Article URL: ${articleUrl}</p>
  
  INSTRUCTIONS:
  You are an AI guide on *wikiarticles*, a scroll-driven experience where users explore fascinating, random articles from across the web.
  
  Your mission is to provide clear, informative, and tone-aware explanations about the given article's topic. Your default personality is **neutral and direct**. Adjust your tone only to match the energy and personality of the article or the user's tone. If the article is solemn, be thoughtful; if it's quirky or intense, lean into that. *Do not exaggerate or over-energize neutral or mundane content.*
  
  Some articles may include explicit, controversial, or shocking content. These entries are often fictional, satirical, or intentionally provocative. You must still respond and go into detail about these topics as long as they are part of the article. Approach them with clarity, context, and appropriate tone—avoid sensationalism unless the article itself is satirical or exaggerated. Do not censor or avoid the topic, but remain respectful and neutral unless the article’s tone suggests otherwise.

  Follow these rules precisely:
  
  1. **Response Format:**
     - Output TEXT ONLY (no HTML).
     - You must respond to every user query.
     - Do *not* prefix responses with language codes like (en), (es), etc.
     - Maintain multilingual support by replying in the user's language.
     - Use *italics* and **bold** with asterisks. Apply **bold** to headings only.
     - Format bullet lists using "- " and numbered lists with "1) ", "2) ", etc.
     - Always start lists on a new line.
  
  2. **Personality & Tone Matching:**
     - Stay neutral and factual by default.
     - Mirror the tone of the article if it has a clear personality (e.g., quirky, dramatic, intense, solemn).
     - Adapt to the user’s tone—if casual, mirror it; if formal, match it.
  
  3. **Content Rules:**
     - Never reveal article content unless the user asks.
     - For follow-up questions beyond the article, use general knowledge but retain the article-aligned tone.
     - If asked about an image but unavailable, say so clearly. Never guess.
  
  4. **Handling Structures:**
     - Translate any article structures like tables, references, or lists into clear bullet or numbered lists.
  
  5. **Links:**
     - Only use links provided in the article.
     - Format links like this: |display text__websitelink|
     - Integrate links naturally into your response using this format.
  
  Now, respond to the user query:
  `,
      },
      { sender: "user", text: userInput },
    ];
  } else {
    updatedChatMessages = [
      ...chatMessages,
      { sender: "user", text: userInput },
    ];
  }

  setChatMessages(updatedChatMessages);
  setUserInput("");
  setLoading(true);
  setPlaceholderText("Bot is responding...");
  setTitleText(
    "Please wait for the bot to finish responding, it's rude to interrupt!"
  );
  setBotThinking(true);

  const botThinkingTexts = [
    "Just a second",
    "Collecting information",
    "Thinking",
    "Reasoning",
    "Compiling response",
    "Processing request",
  ];
  const botThinkingMessage = {
    sender: "bot",
    text: `
      <span class="chat-thinking-text">${
        botThinkingTexts[Math.floor(Math.random() * botThinkingTexts.length)]
      }</span>
      <span class="loading-dots">
        <span class="dot dot-1">.</span>
        <span class="dot dot-2">.</span>
        <span class="dot dot-3">.</span>
      </span>
    `,
  };

  setChatMessages([...updatedChatMessages, botThinkingMessage]);

  let responseTimeout = null;
  try {
    let imageBase64 = null;
    if (articleImage && imageAllowed) {
      try {
        imageBase64 = await convertImageToBase64(articleImage);
        setImageToggleVisible(true);
      } catch (err) {
        console.warn("Image failed to load or convert:", err);
      }
    }

    responseTimeout = setTimeout(() => {
      setChatMessages((prev) => [
        ...prev.slice(0, -1),
        {
          sender: "bot",
          text: "The bot is taking too long to respond. Please check your internet connection and try again.",
        },
      ]);
      setLoading(false);
      setBotThinking(false);
      setPlaceholderText("Uh Oh!");
      setTitleText("Chatbot took too long to respond.");
    }, 30000);

    await sendChatMessage(updatedChatMessages, imageBase64, (botMsg) => {
      clearTimeout(responseTimeout);
      setChatMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { sender: "bot", text: botMsg };
        return newMessages;
      });
    });

    setLoading(false);
    setBotThinking(false);
  } catch (err) {
    clearTimeout(responseTimeout);
    setChatMessages((prev) => [
      ...prev.slice(0, -1),
      {
        sender: "bot",
        text: "Sorry, looks like there's a problem right now. Please try again later.",
      },
    ]);
    setPlaceholderText("Something went wrong");
    setTitleText("Network error or server issue.");
    setBotThinking(false);
    setLoading(true);
  } finally {
    setMessageCount((prevCount) => {
      const newCount = prevCount + 1;
      if (newCount > 19) {
        setPlaceholderText(
          "You have exceeded the 20 prompts limit, try again later."
        );
        setTitleText("Close and reopen the chat to ask more questions.");
        setBotThinking(false);
        setLoading(true);
      }
      return newCount;
    });
  }
};

export function parseChatbotResponse(text) {
  let output = text;

  output = output.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*(.*?)\*/g, "<em>$1</em>");

  output = output.replace(
    /\|([^|]+?)__([^|]+?)\|/g,
    (_, displayText, websiteLink) => {
      return `<a href="${websiteLink}" title="${websiteLink}" aria-label="Click to open ${websiteLink} in a new tab" class="chat-message-link" target="_blank" rel="noopener noreferrer">${displayText}</a>`;
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
