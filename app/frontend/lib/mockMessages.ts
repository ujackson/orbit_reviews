import { Message, Channel } from '../features/inbox/types';

// Mock data for enterprise inbox
export const mockMessages: Message[] = [
  {
    id: '1',
    channel: 'email',
    subject: 'Q4 Product Roadmap Review',
    preview: 'Hi team, I wanted to share the updated Q4 roadmap for review. Key priorities include...',
    body: `Hi team,

I wanted to share the updated Q4 roadmap for review. Key priorities include:

1. Enhanced AI capabilities for inbox management
2. Multi-channel integration improvements
3. Advanced analytics dashboard
4. Mobile app beta release

Please review and add your feedback by EOD Wednesday.

Best,
Sarah`,
    sender: {
      id: 'u1',
      name: 'Sarah Chen',
      email: 'sarah.chen@acmecorp.com',
      avatar: 'SC',
      organization: 'Acme Corp'
    },
    timestamp: new Date('2026-02-21T09:30:00'),
    status: 'unread',
    priority: 'high',
    hasAttachments: true,
    attachmentCount: 3,
    attachments: [
      {
        id: 'att1',
        name: 'Q4_Roadmap_2026.pdf',
        type: 'pdf',
        mimeType: 'application/pdf',
        size: 2457600, // 2.4 MB
        url: '#',
        source: 'email',
        uploadedAt: new Date('2026-02-21T09:30:00'),
        includeInAI: true,
        aiSummary: 'Product roadmap document outlining Q4 2026 priorities including AI enhancements, multi-channel integrations, analytics dashboard, and mobile app beta.',
        aiExtractedFields: {
          'Quarter': 'Q4 2026',
          'Key Projects': '4 major initiatives',
          'Timeline': 'October - December 2026',
          'Total Budget': '$450K',
        },
        citations: [
          {
            text: 'AI capabilities budget allocated at $180K for Q4',
            location: 'page 3',
          },
          {
            text: 'Mobile app beta scheduled for December 15th launch',
            location: 'page 7',
          },
        ],
      },
      {
        id: 'att2',
        name: 'roadmap_screenshot.png',
        type: 'image',
        mimeType: 'image/png',
        size: 856400, // 856 KB
        url: '#',
        thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
        source: 'email',
        uploadedAt: new Date('2026-02-21T09:30:00'),
        includeInAI: true,
        aiDescription: 'Gantt chart visualization showing Q4 project timeline with color-coded milestones across four workstreams',
      },
      {
        id: 'att3',
        name: 'budget_analysis.xlsx',
        type: 'spreadsheet',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 124800, // 122 KB
        url: '#',
        source: 'email',
        uploadedAt: new Date('2026-02-21T09:30:00'),
        includeInAI: false,
      },
    ],
    labels: ['product', 'roadmap'],
    threadCount: 5,
    aiSummary: 'Product roadmap review request with Q4 priorities and feedback deadline.'
  },
  {
    id: '2',
    channel: 'slack',
    subject: 'Engineering standup - blocking issue',
    preview: '@channel We have a critical deployment issue that needs immediate attention...',
    body: `@channel We have a critical deployment issue that needs immediate attention.

The production API is returning 503 errors for ~15% of requests. Initial investigation suggests it's related to the database connection pool.

Working on it now but could use help from platform team.`,
    sender: {
      id: 'u2',
      name: 'Marcus Rodriguez',
      email: 'marcus@orbit.com',
      avatar: 'MR',
      organization: 'Orbit'
    },
    timestamp: new Date('2026-02-21T08:45:00'),
    status: 'unread',
    priority: 'urgent',
    hasAttachments: false,
    labels: ['engineering', 'urgent'],
    threadCount: 12,
    aiSummary: 'Critical production issue: API returning 503 errors, needs platform team assistance.'
  },
  {
    id: '3',
    channel: 'whatsapp',
    subject: 'Client meeting rescheduled',
    preview: 'Hi! Just got word from TechFlow - they need to move tomorrow\'s demo to next week...',
    body: `Hi! Just got word from TechFlow - they need to move tomorrow's demo to next week.

Can you do Tuesday 2 PM PST instead? They're very interested but their CTO has a conflict.

Let me know ASAP so I can confirm.`,
    sender: {
      id: 'u3',
      name: 'Jessica Park',
      email: 'jessica@orbit.com',
      avatar: 'JP',
      organization: 'Orbit Sales'
    },
    timestamp: new Date('2026-02-21T07:20:00'),
    status: 'read',
    priority: 'normal',
    hasAttachments: false,
    labels: ['sales', 'meeting'],
    threadCount: 3
  },
  {
    id: '4',
    channel: 'email',
    subject: 'Security audit findings - Action Required',
    preview: 'Following our recent security audit, we\'ve identified several items requiring immediate attention...',
    body: `Following our recent security audit, we've identified several items requiring immediate attention:

HIGH PRIORITY:
- Update OAuth implementation to use PKCE flow
- Implement rate limiting on public API endpoints
- Enable MFA for all admin accounts

MEDIUM PRIORITY:
- Update dependency versions with known CVEs
- Implement request signing for webhook callbacks
- Enhanced logging for authentication events

Please review the full report (attached) and plan remediation by end of Q1.

-Security Team`,
    sender: {
      id: 'u4',
      name: 'Security Team',
      email: 'security@orbit.com',
      avatar: 'ST',
      organization: 'Orbit'
    },
    timestamp: new Date('2026-02-20T16:30:00'),
    status: 'unread',
    priority: 'urgent',
    hasAttachments: true,
    attachmentCount: 1,
    labels: ['security', 'compliance'],
    threadCount: 1,
    aiSummary: 'Security audit reveals urgent items: OAuth updates, rate limiting, and MFA requirements.'
  },
  {
    id: '5',
    channel: 'instagram',
    subject: 'Customer inquiry about enterprise plan',
    preview: 'Hey! Loving the product so far. Our team is growing and we\'re interested in...',
    body: `Hey! Loving the product so far. Our team is growing and we're interested in your enterprise plan.

Quick questions:
- What's the pricing for 50+ users?
- Do you offer custom integrations?
- Can we get a dedicated support channel?

Thanks!`,
    sender: {
      id: 'u5',
      name: 'Alex Thompson',
      email: 'alex@growthstartup.io',
      avatar: 'AT',
      organization: 'Growth Startup'
    },
    timestamp: new Date('2026-02-20T14:15:00'),
    status: 'read',
    priority: 'high',
    hasAttachments: false,
    labels: ['sales', 'support'],
    threadCount: 2
  },
  {
    id: '6',
    channel: 'sms',
    subject: 'Appointment confirmation needed',
    preview: 'Hi! This is a reminder about your consultation call scheduled for Feb 23 at 3 PM...',
    body: `Hi! This is a reminder about your consultation call scheduled for Feb 23 at 3 PM.

Please reply YES to confirm or RESCHEDULE if you need a different time.

Looking forward to speaking with you!

- Orbit Customer Success`,
    sender: {
      id: 'u6',
      name: 'Orbit CS',
      email: 'cs@orbit.com',
      avatar: 'CS',
      organization: 'Orbit'
    },
    timestamp: new Date('2026-02-20T11:00:00'),
    status: 'read',
    priority: 'normal',
    hasAttachments: false,
    labels: ['customer-success'],
    threadCount: 1
  },
  {
    id: '7',
    channel: 'email',
    subject: 'Weekly metrics report - Week of Feb 15',
    preview: 'Here\'s your weekly summary of key product metrics...',
    body: `Here's your weekly summary of key product metrics:

📊 USER GROWTH
- New signups: 1,247 (+15% WoW)
- Active users: 12,450 (+8% WoW)
- Churn rate: 2.1% (-0.3% WoW)

💰 REVENUE
- MRR: $145,000 (+12% WoW)
- New contracts: $23,000
- Expansion revenue: $8,500

🎯 ENGAGEMENT
- Messages processed: 485,000
- Avg response time: 2.3 hours
- Customer satisfaction: 94%

Full dashboard: https://analytics.orbit.com/weekly

Great progress team!`,
    sender: {
      id: 'u8',
      name: 'Analytics Bot',
      email: 'analytics@orbit.com',
      avatar: 'AB',
      organization: 'Orbit'
    },
    timestamp: new Date('2026-02-19T09:00:00'),
    status: 'read',
    priority: 'normal',
    hasAttachments: false,
    labels: ['analytics', 'weekly'],
    threadCount: 1,
    aiSummary: 'Positive weekly metrics: 15% signup growth, 12% MRR increase, 94% customer satisfaction.'
  },
  {
    id: '8',
    channel: 'slack',
    subject: 'Design review: New inbox filters',
    preview: 'Hey team! Posted the new filter designs in Figma. Would love feedback by tomorrow...',
    body: `Hey team! Posted the new filter designs in Figma. Would love feedback by tomorrow.

Key changes:
✨ Multi-select channel filters
✨ Smart filters based on AI sentiment
✨ Saved filter presets
✨ Keyboard shortcuts for quick switching

Link: https://figma.com/file/abc123

cc @sarah @marcus`,
    sender: {
      id: 'u9',
      name: 'Emma Davis',
      email: 'emma@orbit.com',
      avatar: 'ED',
      organization: 'Orbit'
    },
    timestamp: new Date('2026-02-18T15:30:00'),
    status: 'archived',
    priority: 'normal',
    hasAttachments: true,
    attachmentCount: 1,
    labels: ['design', 'product'],
    threadCount: 8
  },
  {
    id: '9',
    channel: 'email',
    subject: 'Partnership opportunity - DataFlow Inc',
    preview: 'I hope this email finds you well. I\'m reaching out regarding a potential partnership...',
    body: `I hope this email finds you well. I'm reaching out regarding a potential partnership between Orbit and DataFlow Inc.

We're a leading data analytics platform with 10,000+ enterprise customers. We think there's strong synergy between our offerings.

Proposed collaboration:
- Native integration between platforms
- Co-marketing opportunities
- Revenue share on mutual customers

Would you be open to a call next week to discuss?

Best regards,
Michael Chang
VP Partnerships, DataFlow Inc`,
    sender: {
      id: 'u10',
      name: 'Michael Chang',
      email: 'michael.chang@dataflow.com',
      avatar: 'MC',
      organization: 'DataFlow Inc'
    },
    timestamp: new Date('2026-02-17T10:15:00'),
    status: 'read',
    priority: 'high',
    hasAttachments: false,
    labels: ['partnerships', 'business-dev'],
    threadCount: 1
  },
  {
    id: '10',
    channel: 'whatsapp',
    subject: 'Quick question about API rate limits',
    preview: 'Hey! Quick question - what are the rate limits on the /messages endpoint?',
    body: `Hey! Quick question - what are the rate limits on the /messages endpoint?

We're seeing some throttling in our integration and want to make sure we're within limits.

Currently doing about 100 requests/min during peak hours.

Thanks!`,
    sender: {
      id: 'u11',
      name: 'Dev Kumar',
      email: 'dev@techsolutions.io',
      avatar: 'DK',
      organization: 'Tech Solutions'
    },
    timestamp: new Date('2026-02-17T08:30:00'),
    status: 'read',
    priority: 'normal',
    hasAttachments: false,
    labels: ['support', 'technical'],
    threadCount: 4
  }
];

export const getChannelColor = (channel: Channel): string => {
  const colors: Record<Channel, string> = {
    email: '#5E6AD2',
    slack: '#E01E5A',
    whatsapp: '#25D366',
    instagram: '#E4405F',
    sms: '#4A90E2'
  };
  return colors[channel];
};

export const getChannelLabel = (channel: Channel): string => {
  const labels: Record<Channel, string> = {
    email: 'Email',
    slack: 'Slack',
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    sms: 'SMS'
  };
  return labels[channel];
};
