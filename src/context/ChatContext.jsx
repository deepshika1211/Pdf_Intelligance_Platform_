/**
 * ChatContext.jsx — Real RAG Chat Context
 * Sends user messages to the FastAPI /chat/ endpoint which runs the
 * Gemini AI Mini RAG Pipeline: FAISS retrieval → Gemini answer → citations.
 */
import React, { createContext, useContext, useState } from 'react';
import { chatAPI } from '../utils/api';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;

  // ---------------------------------------------------------------------------
  // Send message — real POST /chat/ to FastAPI RAG pipeline
  // ---------------------------------------------------------------------------
  const sendMessage = async (text, targetPdf) => {
    if (!text.trim()) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Add user message immediately to UI
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...s.messages, userMessage] };
        }
        return s;
      })
    );

    setIsTyping(true);

    try {
      // Call FastAPI RAG pipeline
      const documentId = targetPdf?.dbId || null;
      const res = await chatAPI.sendMessage(text, documentId);
      const { answer, citations } = res.data;

      const aiMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: answer,
        citations: citations || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return { ...s, messages: [...s.messages, aiMessage] };
          }
          return s;
        })
      );
    } catch (err) {
      // Show error as AI message so user sees what went wrong
      const errorMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: err.response?.data?.detail
          ? `⚠️ ${err.response.data.detail}`
          : '⚠️ Could not reach the AI backend. Please make sure FastAPI is running at localhost:8000.',
        citations: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return { ...s, messages: [...s.messages, errorMessage] };
          }
          return s;
        })
      );
    } finally {
      setIsTyping(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Create new chat session
  // ---------------------------------------------------------------------------
  const createNewSession = (pdf) => {
    const newSession = {
      id: `chat-${Date.now()}`,
      pdfId: pdf?.id || null,
      pdfDbId: pdf?.dbId || null,
      pdfName: pdf?.name || 'General Document',
      title: pdf?.name
        ? `Chat: ${pdf.name.substring(0, 28)}${pdf.name.length > 28 ? '...' : ''}`
        : 'New AI Session',
      date: 'Just now',
      messages: [
        {
          id: `msg-start-${Date.now()}`,
          sender: 'ai',
          text: pdf
            ? `Hello! I have indexed **${pdf.name}** (${pdf.pages} pages). Ask me anything about this document — I'll retrieve relevant sections and answer with page citations.`
            : `Hello! I'm your AI document assistant. Upload a PDF and I'll index it for semantic question answering with exact page citations.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: [],
        },
      ],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    return newSession.id;
  };

  return (
    <ChatContext.Provider
      value={{
        sessions,
        activeSession,
        activeSessionId,
        setActiveSessionId,
        sendMessage,
        createNewSession,
        isTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
