export const INITIAL_PDFS = [
  {
    id: 'pdf-1',
    name: 'Q4_2025_Financial_Performance_Report.pdf',
    size: '4.2 MB',
    sizeBytes: 4404019,
    pages: 38,
    uploadDate: '2026-07-20T10:30:00Z',
    category: 'Finance',
    tags: ['Quarterly', 'Earnings', 'Audit'],
    favorite: true,
    thumbnailBg: 'from-blue-600 to-indigo-700',
    iconColor: 'text-blue-500',
    summary: 'Comprehensive evaluation of Q4 revenue, operational expenditure, EBIT margins, and regional growth metrics for fiscal year 2025.',
    highlights: [
      { page: 4, text: 'Total revenue grew by 24.8% YoY to $142.5M.' },
      { page: 12, text: 'Operating expenses decreased by 6.2% due to cloud optimizations.' },
      { page: 28, text: 'EBITDA margin reached 31.4% exceeding analyst expectations.' }
    ]
  }
];

export const INITIAL_CHAT_SESSIONS = [
  {
    id: 'chat-1',
    pdfId: 'pdf-1',
    pdfName: 'Q4_2025_Financial_Performance_Report.pdf',
    title: 'Q4 Revenue Growth & EBIT Margins',
    date: '10 minutes ago',
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        text: 'What were the main drivers for our revenue growth in Q4 2025 and what was the final EBITDA margin?',
        timestamp: '10:30 AM'
      },
      {
        id: 'msg-2',
        sender: 'ai',
        text: 'Based on **Page 4** and **Page 28** of `Q4_2025_Financial_Performance_Report.pdf`:\n\n1. **Revenue Growth Drivers**:\n   - Total revenue grew **24.8% YoY to $142.5M**.\n   - Expansion in Enterprise subscriptions contributed 68% of new ARR.\n   - Cloud operational expenses decreased by **6.2%**.\n\n2. **EBITDA Margin**:\n   - The adjusted EBITDA margin reached **31.4%** (Page 28), exceeding market consensus estimates of 28.5%.',
        citations: [
          { page: 4, snippet: 'Total revenue grew by 24.8% YoY to $142.5M driven by enterprise ARR.' },
          { page: 28, snippet: 'EBITDA margin reached 31.4% exceeding analyst expectations.' }
        ],
        timestamp: '10:31 AM'
      }
    ]
  }
];

export const MOCK_ACTIVITY_FEED = [
  { id: 'act-1', type: 'upload', user: 'Alex Morgan', action: 'uploaded document', target: 'Q4_2025_Financial_Performance_Report.pdf', time: '10 mins ago', icon: 'FileUp', color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50' },
  { id: 'act-2', type: 'ai', user: 'AI Engine', action: 'completed vector indexing (38 pages)', target: 'Q4_2025_Financial_Performance_Report.pdf', time: '8 mins ago', icon: 'Sparkles', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/50' },
  { id: 'act-3', type: 'query', user: 'Alex Morgan', action: 'asked question: "What were revenue drivers..."', target: 'AI Chat Session', time: '5 mins ago', icon: 'MessageSquare', color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/50' },
  { id: 'act-4', type: 'favorite', user: 'Alex Morgan', action: 'starred document', target: 'Q4_2025_Financial_Performance_Report.pdf', time: '1 hour ago', icon: 'Star', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50' }
];

export const MOCK_UPLOAD_TRENDS = [
  { month: 'Jan', uploads: 18, queries: 120 },
  { month: 'Feb', uploads: 25, queries: 185 },
  { month: 'Mar', uploads: 32, queries: 240 },
  { month: 'Apr', uploads: 45, queries: 390 },
  { month: 'May', uploads: 58, queries: 510 },
  { month: 'Jun', uploads: 72, queries: 680 },
  { month: 'Jul', uploads: 94, queries: 890 },
];

export const MOCK_STORAGE_DATA = [
  { name: 'Finance', value: 35, color: '#6366F1' },
  { name: 'Engineering', value: 45, color: '#8B5CF6' },
  { name: 'Legal', value: 12, color: '#06B6D4' },
  { name: 'Product', value: 20, color: '#10B981' },
  { name: 'Others', value: 10, color: '#F59E0B' },
];
