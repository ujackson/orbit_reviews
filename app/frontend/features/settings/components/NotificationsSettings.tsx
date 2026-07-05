/**
 * Component: NotificationsSettings
 * 
 * Enterprise notification controls - Google Workspace style.
 * Structured toggle rows, not cards. Calm and operational.
 */

import { Box, Divider, alpha } from '@mui/material';
import { useState } from 'react';
import { SettingRow } from '../patterns/SettingRow';
import { SettingSection } from '../patterns/SettingSection';
import { color } from '../../../shared/tokens/design-tokens';

export const NotificationsSettings = () => {
  // Channel preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  // AI assistance state
  const [aiSummaries, setAiSummaries] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [aiUrgentDetection, setAiUrgentDetection] = useState(true);
  const [aiSentimentAlerts, setAiSentimentAlerts] = useState(false);

  // Assignment & status state
  const [assignmentNotifications, setAssignmentNotifications] = useState(true);
  const [statusChangeNotifications, setStatusChangeNotifications] = useState(true);
  const [mentionNotifications, setMentionNotifications] = useState(true);
  const [teamActivityNotifications, setTeamActivityNotifications] = useState(false);

  // Automation state
  const [ruleExecutionAlerts, setRuleExecutionAlerts] = useState(false);
  const [automationFailures, setAutomationFailures] = useState(true);
  const [integrationErrors, setIntegrationErrors] = useState(true);

  // Digest state
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [monthlyReport, setMonthlyReport] = useState(false);

  return (
    <Box>
      {/* Channel Preferences */}
      <SettingSection
        title="Channel Preferences"
        description="Choose where you want to receive notifications from Orbit"
        isFirst
      >
        <SettingRow
          label="Email notifications"
          description="Receive notifications via email for new messages and updates"
          checked={emailNotifications}
          onChange={setEmailNotifications}
        />
        <Divider sx={{ borderColor: alpha(color.neutral[900], 0.04) }} />
        <SettingRow
          label="Slack notifications"
          description="Get notified in your Slack workspace when important events occur"
          checked={slackNotifications}
          onChange={setSlackNotifications}
        />
        <Divider sx={{ borderColor: alpha(color.neutral[900], 0.04) }} />
        <SettingRow
          label="WhatsApp notifications"
          description="Receive critical alerts via WhatsApp for urgent messages"
          checked={whatsappNotifications}
          onChange={setWhatsappNotifications}
        />
        <Divider sx={{ borderColor: alpha(color.neutral[900], 0.04) }} />
        <SettingRow
          label="Push notifications"
          description="Browser push notifications for real-time updates while using Orbit"
          checked={pushNotifications}
          onChange={setPushNotifications}
        />
      </SettingSection>

      {/* AI Assistance Notifications */}
      <SettingSection
        title="AI Assistance Notifications"
        description="Control when Orbit's AI sends you intelligent alerts and insights"
      >
        <SettingRow
          label="AI-generated summaries"
          description="Receive automatic summaries of long conversation threads"
          checked={aiSummaries}
          onChange={setAiSummaries}
        />
        <Divider sx={{ borderColor: alpha(color.neutral[900], 0.04) }} />
        <SettingRow
          label="Suggested replies"
          description="Get notified when AI has generated a suggested response for you"
          checked={aiSuggestions}
          onChange={setAiSuggestions}
        />
        <Divider sx={{ borderColor: alpha(color.neutral[900], 0.04) }} />
        <SettingRow
          label="Urgent message detection"
          description="Alert me when AI detects an urgent or time-sensitive message"
          checked={aiUrgentDetection}
          onChange={setAiUrgentDetection}
        />
        <Divider sx={{ borderColor: alpha(color.neutral[900], 0.04) }} />
        <SettingRow
          label="Sentiment change alerts"
          description="Notify me when AI detects a significant shift in customer sentiment"
          checked={aiSentimentAlerts}
          onChange={setAiSentimentAlerts}
        />
      </SettingSection>

      {/* Assignment & Status Updates */}
      <SettingSection
        title="Assignment & Status Updates"
        description="Stay informed about team assignments and conversation status changes"
      >
        <SettingRow
          label="New assignments"
          description="Notify me when a conversation is assigned to me or my team"
          checked={assignmentNotifications}
          onChange={setAssignmentNotifications}
        />
        <Divider sx={{ borderColor: alpha(color.neutral[900], 0.04) }} />
        <SettingRow
          label="Status changes"
          description="Alert me when conversations change status (open, in progress, closed)"
          checked={statusChangeNotifications}
          onChange={setStatusChangeNotifications}
        />
        <Divider sx={{ borderColor: alpha(color.neutral[900], 0.04) }} />
        <SettingRow
          label="Mentions and replies"
          description="Notify me when someone mentions me or replies to my messages"
          checked={mentionNotifications}
          onChange={setMentionNotifications}
        />
        <Divider sx={{ borderColor: alpha(color.neutral[900], 0.04) }} />
        <SettingRow
          label="Team activity"
          description="Get updates about conversations your team is working on"
          checked={teamActivityNotifications}
          onChange={setTeamActivityNotifications}
        />
      </SettingSection>

      {/* Automation Alerts */}
      <SettingSection
        title="Automation Alerts"
        description="Monitor automated workflows and integration health"
      >
        <SettingRow
          label="Rule execution alerts"
          description="Notify me each time an automation rule is triggered (may be high volume)"
          checked={ruleExecutionAlerts}
          onChange={setRuleExecutionAlerts}
        />
        <Divider sx={{ borderColor: alpha(color.neutral[900], 0.04) }} />
        <SettingRow
          label="Automation failures"
          description="Alert me immediately when an automation rule fails to execute"
          checked={automationFailures}
          onChange={setAutomationFailures}
        />
        <Divider sx={{ borderColor: alpha(color.neutral[900], 0.04) }} />
        <SettingRow
          label="Integration errors"
          description="Notify me about errors with connected services (Slack, Email, WhatsApp)"
          checked={integrationErrors}
          onChange={setIntegrationErrors}
        />
      </SettingSection>

      {/* Weekly Summary Digest */}
      <SettingSection
        title="Summary Digests"
        description="Receive periodic summaries of your Orbit activity and insights"
      >
        <SettingRow
          label="Weekly digest"
          description="Get a weekly summary of conversations, AI insights, and team performance"
          checked={weeklyDigest}
          onChange={setWeeklyDigest}
        />
        <Divider sx={{ borderColor: alpha(color.neutral[900], 0.04) }} />
        <SettingRow
          label="Monthly report"
          description="Receive a comprehensive monthly report with analytics and trends"
          checked={monthlyReport}
          onChange={setMonthlyReport}
        />
      </SettingSection>
    </Box>
  );
};
