import { useState } from "react";

export default function useChatStream(apiUrl) {
  const [loading, setLoading] = useState(false);

  const sendChatMessage = async (chatHistory, imageBase64, onMessage) => {
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatHistory, imageBase64 }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Server responded with an error.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMessage = "";
      const processStream = async () => {
        const { done, value } = await reader.read();
        if (done) {
          setLoading(false);
          return;
        }
        const chunkText = decoder.decode(value, { stream: true });
        const words = chunkText.split(" ");
        for (let word of words) {
          botMessage += word + " ";
          onMessage(botMessage);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        processStream();
      };
      processStream();
    } catch (error) {
      setLoading(false);
      console.error("Chat stream error:", error);
      throw error;
    }
  };

  return { sendChatMessage, loading };
}
