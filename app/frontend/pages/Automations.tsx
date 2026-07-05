import { AutomationsView, type Automation } from '@/features/automations/AutomationsView';
import { OrbitReviewsPage } from './OrbitReviewsPage';
import type { AutomationRule } from '@/types';

type AutomationsProps = {
  automationRules?: AutomationRule[];
};

const titleize = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

const toAutomation = (rule: AutomationRule): Automation => ({
  id: String(rule.id),
  name: rule.name,
  trigger: titleize(rule.triggerType),
  action: titleize(rule.actionType),
  active: rule.status === 'active',
  status: rule.status as Automation['status'],
  runs: rule.runsCount,
  lastRun: rule.lastRunAt ? new Date(rule.lastRunAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Never',
  failureReason: rule.failureMessage ?? undefined,
});

export default function Automations({ automationRules }: AutomationsProps) {
  return (
    <OrbitReviewsPage title="Automations">
      <AutomationsView automations={automationRules?.map(toAutomation)} />
    </OrbitReviewsPage>
  );
}
