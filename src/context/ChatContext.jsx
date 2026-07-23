import React, { createContext, useContext, useState } from 'react';
import { INITIAL_CHAT_SESSIONS } from '../utils/mockData';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [sessions, setSessions] = useState(INITIAL_CHAT_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState(INITIAL_CHAT_SESSIONS[0].id);
  const [isTyping, setIsTyping] = useState(false);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const sendMessage = (text, targetPdf) => {
    if (!text.trim()) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update active session with user message
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, userMessage],
          };
        }
        return s;
      })
    );

    setIsTyping(true);

    // Simulate AI response stream
    setTimeout(() => {
      let aiText = '';
      let citations = [];

      const docName = targetPdf ? targetPdf.name : activeSession?.pdfName || 'uploaded document';

      if (text.toLowerCase().includes('summarize')) {
        aiText = `Here is an executive summary of **${docName}**:\n\n1. **Core Objective**: The document outlines key operational strategies, compliance requirements, and performance milestones.\n2. **Key Metrics**: Highlighted growth indicators show a 24.8% improvement across primary KPIs.\n3. **Action Items**: Requires executive sign-off prior to next quarter audit.`;
        citations = [
          { page: 1, snippet: 'Executive summary overview and strategic alignment.' },
          { page: 4, snippet: 'Performance metrics and revenue growth vectors.' }
        ];
      } else if (text.toLowerCase().includes('date') || text.toLowerCase().includes('timeline')) {
        aiText = `Important dates extracted from **${docName}**:\n\n* **Q3 Launch Target**: September 15, 2026\n* **Compliance Renewal**: October 31, 2026\n* **Annual Audit Review**: December 10, 2026`;
        citations = [
          { page: 8, snippet: 'Milestone deadlines and quarterly review schedules.' }
        ];
      } else if (text.toLowerCase().includes('table') || text.toLowerCase().includes('data')) {
        aiText = `Extracted data table from **${docName}** (Page 12):\n\n| Category | Q3 Metric | Q4 Target | Growth |\n| :--- | :--- | :--- | :--- |\n| Revenue | $34.2M | $42.5M | +24.2% |\n| OpEx | $12.1M | $11.4M | -5.8% |\n| Margin | 28.5% | 31.4% | +2.9% |`;
        citations = [
          { page: 12, snippet: 'Financial overview and metrics table.' }
        ];
      } else {
        aiText = `I have analyzed **${docName}** regarding your query:\n\n"${text}"\n\nBased on semantic analysis of **Page 3** and **Page 7**, the document emphasizes strict operational parameters and standardized AI indexing protocols. All extracted metrics align with the target compliance threshold.`;
        citations = [
          { page: 3, snippet: 'System specifications and operational parameters.' },
          { page: 7, snippet: 'Compliance threshold validation and audit logs.' }
        ];
      }

      const aiMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: aiText,
        citations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, aiMessage],
            };
          }
          return s;
        })
      );
      setIsTyping(false);
    }, 1500);
  };

  const createNewSession = (pdf) => {
    const newSession = {
      id: `chat-${Date.now()}`,
      pdfId: pdf?.id || 'pdf-1',
      pdfName: pdf?.name || 'General Document',
      title: `Chat with ${pdf?.name ? pdf.name.substring(0, 24) + '...' : 'New PDF'}`,
      date: 'Just now',
      messages: [
        {
          id: `msg-start`,
          sender: 'ai',
          text: `Hello! I have indexed **${pdf?.name || 'your document'}** (${pdf?.pages || 24} pages). How can I assist you with analyzing this document today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]
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
