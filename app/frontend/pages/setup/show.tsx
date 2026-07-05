import {
  Box,
  Button,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Paper,
} from '@mui/material';
import {
  RocketLaunch,
  CheckCircle,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'motion/react';
import { color, status } from '@/shared/tokens/design-tokens.ts';
import {SetupForm, SetupOptions} from "@/types";
import {useNavigate} from "@/hooks/useInertiaNavigation.ts";
import { setup } from "@/api"
import {Head, useForm} from "@inertiajs/react";
import {resolveIconComponent} from "@/lib/iconRegistry.tsx";

type SetupPageProps = {
    currentStep: string;
    setupOptions: SetupOptions;
    setupForm: SetupForm;
    organizationDomainRecommendation?: {
        domain: string;
        sourceEmail: string;
        workspaceName?: string;
    } | null;
};

type SetupFormPayload = {
    workspace_name: string;
    industry: string;
    team_size: string;
    role: string;
    use_cases: string[];
    channels: string[];
    step?: string;
};

type SetupFormErrorKey = keyof SetupFormPayload;

const STEP_FIELDS: Record<number, Array<SetupFormErrorKey>> = {
    0: ['workspace_name', 'industry'],
    1: ['team_size', 'role'],
    2: ['use_cases', 'channels'],
};

export default function Show({ currentStep, setupOptions, setupForm, organizationDomainRecommendation }: SetupPageProps) {
    const navigate = useNavigate();
    const form = useForm<SetupFormPayload>({
        workspace_name: setupForm.workspaceName ?? organizationDomainRecommendation?.workspaceName ?? '',
        industry: setupForm.industry ?? '',
        team_size: setupForm.teamSize ?? '',
        role: setupForm.role ?? '',
        use_cases: setupForm.useCases ?? [],
        channels: setupForm.channels ?? [],
    });
    const errors = form.errors as Partial<Record<SetupFormErrorKey, string>>;
    const stepKeys = setupOptions.stepKeys;
    const activeStep = Math.max(0, stepKeys.indexOf(currentStep));

    const toggleValue = (key: 'use_cases' | 'channels', value: string) => {
        const selectedValues = form.data[key] ?? [];
        const exists = selectedValues.includes(value);
        form.setData(
            key,
            exists ? selectedValues.filter((v) => v !== value) : [...selectedValues, value]
        );
    };

    const isStepValid = () => {
        const fields = STEP_FIELDS[activeStep];
        if (!fields) return true;

        return fields.every((field) => {
            const value = form.data[field];
            return Array.isArray(value) ? value.length > 0 : !!value?.trim();
        });
    };

    const onNext = () => {
        form.transform((data) => ({
            ...data,
            step: currentStep,
        }));

        form.patch('/setup', {
            preserveScroll: true,
        });
    };

    const onBack = () => {
        const previousStep = stepKeys[Math.max(0, activeStep - 1)];
        navigate(setup.show.path({ step: previousStep }), { preserveScroll: true });
    };

    return (
        <>
            <Head key={currentStep} title={`Setup ${setupOptions.steps[activeStep] ?? ''}`} />
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${color.surface.environment} 0%, ${color.surface.ai} 100%)`,
                    py: { xs: 3, sm: 4, md: 6 },
                    overflowY: 'auto',
                }}
            >
                <Box sx={{ width: '100%', maxWidth: 720, px: { xs: 2, sm: 3 } }}>
                    {/* Logo */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 56,
                                height: 56,
                                borderRadius: 2,
                                background: `linear-gradient(135deg, ${color.ai[500]} 0%, ${color.ai[600]} 100%)`,
                                mb: 2,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: 24,
                                    fontWeight: 600,
                                    color: color.neutral[0],
                                    letterSpacing: '-0.5px',
                                }}
                            >
                                O
                            </Typography>
                        </Box>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 600,
                                color: color.neutral[900],
                                mb: 0.5,
                            }}
                        >
                            Welcome to Orbit
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: color.neutral[600],
                            }}
                        >
                            Let's set up your workspace in a few quick steps
                        </Typography>
                    </Box>

                    {/* Stepper */}
                    <Box sx={{ mb: 4 }}>
                        <Stepper activeStep={activeStep} alternativeLabel>
                            {setupOptions.steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>

                    {/* Content Card */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, sm: 4 },
                            borderRadius: 2,
                            border: `1px solid ${color.neutral[200]}`,
                            backgroundColor: color.surface.primary,
                            minHeight: { xs: 'auto', sm: 400 },
                            maxHeight: { xs: 'calc(100vh - 280px)', sm: 'calc(100vh - 300px)' },
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', pr: { xs: 0, sm: 1 } }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Step 0: Workspace */}
                                    {activeStep === 0 && (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                            <Box>
                                                <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
                                                    Create your workspace
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: color.neutral[600] }}>
                                                    Tell us about your organization
                                                </Typography>
                                            </Box>

                                            <TextField
                                                fullWidth
                                                label="Workspace name"
                                                placeholder="e.g., Acme Inc."
                                                value={form.data.workspace_name ?? ''}
                                                onChange={(e) => form.setData('workspace_name', e.target.value)}
                                                error={!!errors.workspace_name}
                                                helperText={errors.workspace_name}
                                                required
                                            />

                                            {organizationDomainRecommendation && (
                                                <Typography variant="body2" sx={{ color: color.neutral[600] }}>
                                                    Recommended organization domain: <strong>{organizationDomainRecommendation.domain}</strong> based on {organizationDomainRecommendation.sourceEmail}
                                                </Typography>
                                            )}

                                            <FormControl>
                                                <FormLabel sx={{ mb: 1, fontSize: 14 }}>Industry</FormLabel>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {setupOptions.industries.map((industry) => (
                                                        <Chip
                                                            key={industry}
                                                            label={industry}
                                                            onClick={() => form.setData('industry', industry)}
                                                            variant={form.data.industry === industry ? 'filled' : 'outlined'}
                                                            color={form.data.industry === industry ? 'primary' : 'default'}
                                                            sx={{ px: 1 }}
                                                        />
                                                    ))}
                                                </Box>
                                                {errors.industry && (
                                                    <Typography sx={{ mt: 1, fontSize: 12, color: color.functional.error }}>{errors.industry}</Typography>
                                                )}
                                            </FormControl>
                                        </Box>
                                    )}

                                    {/* Step 1: Team */}
                                    {activeStep === 1 && (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                            <Box>
                                                <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
                                                    About your team
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: color.neutral[600] }}>
                                                    Help us understand your team size and role
                                                </Typography>
                                            </Box>

                                            <FormControl>
                                                <FormLabel sx={{ mb: 1, fontSize: 14 }}>Team size</FormLabel>
                                                <RadioGroup
                                                    value={form.data.team_size ?? ''}
                                                    onChange={(e) => form.setData('team_size', e.target.value)}
                                                >
                                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                                                        {setupOptions.teamSizes.map((size) => (
                                                            <FormControlLabel
                                                                key={size}
                                                                value={size}
                                                                control={<Radio size="small" />}
                                                                label={size}
                                                                sx={{
                                                                    border: `1px solid ${color.neutral[200]}`,
                                                                    borderRadius: 1,
                                                                    px: 1.5,
                                                                    py: 0.5,
                                                                    m: 0,
                                                                    '&:hover': {
                                                                        backgroundColor: color.neutral[50],
                                                                    },
                                                                }}
                                                            />
                                                        ))}
                                                    </Box>
                                                </RadioGroup>
                                                {errors.team_size && (
                                                    <Typography sx={{ mt: 1, fontSize: 12, color: color.functional.error }}>{errors.team_size}</Typography>
                                                )}
                                            </FormControl>

                                            <TextField
                                                fullWidth
                                                label="Your role"
                                                placeholder="e.g., Customer Success Manager"
                                                value={form.data.role ?? ''}
                                                onChange={(e) => form.setData('role', e.target.value)}
                                                error={!!errors.role}
                                                helperText={errors.role}
                                                required
                                            />
                                        </Box>
                                    )}

                                    {/* Step 2: Channels */}
                                    {activeStep === 2 && (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                            <Box>
                                                <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
                                                    Configure your inbox
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: color.neutral[600] }}>
                                                    Select your primary use cases and connect your first inbox integrations
                                                </Typography>
                                            </Box>

                                            <FormControl>
                                                <FormLabel sx={{ mb: 1.5, fontSize: 14 }}>What will you use Orbit for?</FormLabel>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                                                    {setupOptions.useCases.map((item) => {
                                                        const Icon = resolveIconComponent(item.icon);
                                                        const selected = (form.data.use_cases ?? []).includes(item.id);
                                                        return (
                                                            <Box
                                                                key={item.id}
                                                                onClick={() => toggleValue('use_cases', item.id)}
                                                                sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1.5,
                                                                    p: 2,
                                                                    border: `2px solid ${
                                                                        selected ? color.functional.primary : color.neutral[200]
                                                                    }`,
                                                                    borderRadius: 1.5,
                                                                    cursor: 'pointer',
                                                                    backgroundColor: selected
                                                                        ? 'rgba(94, 106, 210, 0.05)'
                                                                        : color.surface.primary,
                                                                    transition: 'all 0.2s',
                                                                    '&:hover': {
                                                                        borderColor: color.functional.primary,
                                                                        backgroundColor: 'rgba(94, 106, 210, 0.03)',
                                                                    },
                                                                }}
                                                            >
                                                                <Box sx={{ color: color.ai[600] }}><Icon /></Box>
                                                                <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                                                                    {item.label}
                                                                </Typography>
                                                                {selected && (
                                                                    <CheckCircle
                                                                        sx={{
                                                                            ml: 'auto',
                                                                            fontSize: 20,
                                                                            color: color.functional.primary,
                                                                        }}
                                                                    />
                                                                )}
                                                            </Box>
                                                        );
                                                    })}
                                                </Box>
                                                {errors.use_cases && (
                                                    <Typography sx={{ mt: 1, fontSize: 12, color: color.functional.error }}>{errors.use_cases}</Typography>
                                                )}
                                            </FormControl>

                                            <FormControl>
                                                <FormLabel sx={{ mb: 1.5, fontSize: 14 }}>Connect your primary inbox integrations</FormLabel>
                                                <Typography variant="body2" sx={{ color: color.neutral[600], mb: 2, fontSize: 12 }}>
                                                    Start with Gmail, Outlook, Slack, or Teams. You can add more integrations later in Settings.
                                                </Typography>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                                                    {setupOptions.channels.map((item) => {
                                                        const Icon = resolveIconComponent(item.icon);
                                                        const selected = (form.data.channels ?? []).includes(item.id);
                                                        const channelColor = color.channel[item.colorKey as keyof typeof color.channel] || color.functional.primary;
                                                        return (
                                                            <Box
                                                                key={item.id}
                                                                onClick={() => toggleValue('channels', item.id)}
                                                                sx={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center',
                                                                    gap: 1,
                                                                    p: 2,
                                                                    border: `2px solid ${
                                                                        selected ? channelColor : color.neutral[200]
                                                                    }`,
                                                                    borderRadius: 1.5,
                                                                    cursor: 'pointer',
                                                                    backgroundColor: selected
                                                                        ? `${channelColor}10`
                                                                        : color.surface.primary,
                                                                    transition: 'all 0.2s',
                                                                    position: 'relative',
                                                                    '&:hover': {
                                                                        borderColor: channelColor,
                                                                        backgroundColor: `${channelColor}08`,
                                                                    },
                                                                }}
                                                            >
                                                                <Box sx={{ color: channelColor }}><Icon /></Box>
                                                                <Typography sx={{ fontSize: 12, fontWeight: 500, textAlign: 'center' }}>
                                                                    {item.label}
                                                                </Typography>
                                                                {selected && (
                                                                    <CheckCircle
                                                                        sx={{
                                                                            position: 'absolute',
                                                                            top: 8,
                                                                            right: 8,
                                                                            fontSize: 16,
                                                                            color: channelColor,
                                                                        }}
                                                                    />
                                                                )}
                                                            </Box>
                                                        );
                                                    })}
                                                </Box>
                                                {errors.channels && (
                                                    <Typography sx={{ mt: 1, fontSize: 12, color: color.functional.error }}>{errors.channels}</Typography>
                                                )}
                                            </FormControl>
                                        </Box>
                                    )}

                                    {/* Step 3: Complete */}
                                    {activeStep === 3 && (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                textAlign: 'center',
                                                py: 4,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: '50%',
                                                    backgroundColor: status.success.bg,
                                                    mb: 3,
                                                }}
                                            >
                                                <RocketLaunch sx={{ fontSize: 40, color: color.functional.success }} />
                                            </Box>

                                            <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                                                You're all set!
                                            </Typography>

                                            <Typography variant="body2" sx={{ color: color.neutral[600], mb: 4, maxWidth: 400 }}>
                                                Your Orbit workspace is ready. We'll help you connect your channels and start managing
                                                all your conversations in one place.
                                            </Typography>

                                            <Box
                                                sx={{
                                                    width: '100%',
                                                    p: 3,
                                                    backgroundColor: color.surface.ai,
                                                    borderRadius: 2,
                                                    border: `1px solid ${color.neutral[200]}`,
                                                    textAlign: 'left',
                                                }}
                                            >
                                                <Typography variant="caption" sx={{ color: color.neutral[600], mb: 1, display: 'block' }}>
                                                    Your workspace summary:
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                    <Typography variant="body2">
                                                        <strong>Name:</strong> {form.data.workspace_name}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        <strong>Industry:</strong> {form.data.industry}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        <strong>Team:</strong> {form.data.team_size}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        <strong>Channels:</strong> {(form.data.channels ?? []).length} selected
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </Box>

                        {/* Navigation Buttons */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, pt: 3, borderTop: `1px solid ${color.neutral[100]}`, flexShrink: 0 }}>
                            <Button
                                onClick={onBack}
                                disabled={activeStep === 0 || form.processing}
                                sx={{
                                    textTransform: 'none',
                                    color: color.neutral[700],
                                }}
                            >
                                Back
                            </Button>

                            <Button
                                variant="contained"
                                onClick={onNext}
                                disabled={!isStepValid() || form.processing}
                                sx={{
                                    px: 4,
                                    py: 1,
                                    backgroundColor: color.functional.primary,
                                    color: color.neutral[0],
                                    textTransform: 'none',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    '&:hover': {
                                        backgroundColor: color.functional.primaryHover,
                                    },
                                }}
                            >
                                {activeStep === setupOptions.steps.length - 1
                                    ? form.processing
                                        ? 'Setting up...'
                                        : 'Get started'
                                    : 'Continue'}
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </>
    );
}
