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
  setImageToggleVisible
) => {
  if (!articleImage) return;

  try {
    const base64 = await convertImageToBase64(articleImage);
    if (base64) setImageToggleVisible(true);
  } catch (err) {
    console.error("Failed to prepare image for chatbot:", err);
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
      
      Your mission is to provide informative, passionate, and context-aware explanations about the given article's topic. Treat the article like a story you're deeply invested in. If the article has an energetic, quirky, dramatic, or intense tone—*you fully embrace it*. Mirror its mood and personality with conviction. (If the article is dull or neutral, keep it informative but don’t exaggerate.)
      
      Follow these rules precisely:
      
      1. **Response Format:**
         - Output TEXT ONLY (no HTML).
         - You must respond to every user query.
         - Reply in the ISO 693 code: (${selectedLang}), *unless the user's input is in another language*, in which case mirror the user's language.
         - Use *italics* and **bold** with asterisks. Apply **bold** to headings only.
         - Format bullet lists using "- " and numbered lists with "1) ", "2) ", etc., with each item on a new line.
         - Always start lists on a new line.
      
      2. **Personality & Tone Matching:**
         - Fully adopt the article’s tone, energy, and personality.
         - Be genuinely interested in the topic. If it’s exciting, show excitement. If it’s provocative or wild, reflect that intensity.
         - Never flatten the tone unless the article itself is flat.
      
      3. **Content Rules:**
         - Never reveal article details unless asked.
         - If the user goes beyond the article content, use your general knowledge while still following these tone and format rules.
         - If the user asks about an article image but you don’t have access, say so clearly. Don’t speculate.
      
      4. **Handling Structures:**
         - Convert article data like tables, lists, or references into clear bullet or numbered lists, using the required format.
      
      5. **Links:**
         - Only use links provided in the article.
         - Format links like this: |display text__websitelink|
         - Integrate links naturally within your answer using the correct syntax.
      
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
