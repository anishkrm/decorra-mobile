import { Badge, Box, Button, Heading, HStack, Progress, Spinner, Text, VStack } from 'native-base';
import { SurfaceCard } from '../components/SurfaceCard';
import { getGenerationErrorMessage } from '../services/jobErrors';
import { useGenerationStore } from '../stores/useGenerationStore';
import { useMakeoverDraftStore } from '../stores/useMakeoverDraftStore';
import { useNavigationStore } from '../stores/useNavigationStore';

const stateCopy = {
  queued: { title: 'Waiting to start', detail: 'Your demo job is queued on this device.', value: 18 },
  processing: { title: 'Working on your demo', detail: 'This simulated job is processing locally.', value: 64 },
  completed: { title: 'Demo job complete', detail: 'The local simulation finished. No AI image was generated.', value: 100 },
  failed: { title: 'Demo job failed', detail: 'The job ended with a recoverable demo error.', value: 100 },
} as const;

export function ProgressScreen() {
  const activeJobId = useGenerationStore((state) => state.activeJobId);
  const job = useGenerationStore((state) => state.jobs.find((item) => item.id === state.activeJobId) ?? null);
  const retryDemoJob = useGenerationStore((state) => state.retryDemoJob);
  const setTab = useNavigationStore((state) => state.setTab);
  const closeProgress = useNavigationStore((state) => state.closeProgress);
  const openCreation = useNavigationStore((state) => state.openCreation);
  const renewDraftId = useMakeoverDraftStore((state) => state.renewDraftId);

  const handleFailureAction = () => {
    switch (job?.errorCode) {
      case 'INVALID_IMAGE':
        renewDraftId();
        openCreation();
        break;
      case 'INSUFFICIENT_CREDITS':
        setTab('plans');
        break;
      case 'TRIAL_USED':
      case 'FORBIDDEN':
        setTab('profile');
        break;
      default:
        break;
    }
  };

  if (!job || job.id !== activeJobId) {
    return (
      <VStack flex={1} bg="paper" safeArea px={5} py={6} space={4}>
        <Badge alignSelf="flex-start" colorScheme="warning" rounded="full">DEVELOPMENT DEMO</Badge>
        <Heading color="ink" fontSize="2xl">No active makeover job</Heading>
        <Text color="muted.600">Start a demo job from Upload and Configure. Nothing has been uploaded.</Text>
        <Button variant="outline" rounded="xl" onPress={() => setTab('home')}>Return Home</Button>
      </VStack>
    );
  }

  const copy = stateCopy[job.state];
  const isPending = job.state === 'queued' || job.state === 'processing';

  return (
    <VStack flex={1} bg="paper" safeArea px={5} py={6} space={5}>
      <HStack alignItems="center" justifyContent="space-between">
        <Text color="brand.700" fontSize="xs" fontWeight="bold" letterSpacing="lg">AI ROOM MAKEOVER</Text>
        <Badge colorScheme="warning" rounded="full">DEMO JOB</Badge>
      </HStack>

      <VStack space={2}>
        <Heading color="ink" fontSize="3xl">Makeover progress</Heading>
        <Text color="muted.600">No fixed timing is promised for real generation. This local simulation is only for previewing job states.</Text>
      </VStack>

      <SurfaceCard>
        <HStack alignItems="center" space={3}>
          {isPending ? <Spinner color="moss" accessibilityLabel={job.state === 'queued' ? 'Job queued' : 'Job processing'} /> : null}
          <VStack flex={1} space={1}>
            <Text color="ink" fontSize="lg" fontWeight="bold" accessibilityLiveRegion="polite">{copy.title}</Text>
            <Text color="muted.600" fontSize="sm">{copy.detail}</Text>
          </VStack>
        </HStack>
        <Progress value={copy.value} colorScheme={job.state === 'failed' ? 'danger' : 'success'} mt={4} accessibilityLabel={`${copy.title}, ${copy.value} percent`} />
        <Text color="muted.500" fontSize="xs" mt={3}>Job ID: {job.id}</Text>
        <Text color="muted.500" fontSize="xs">Attempt {job.attemptCount} · Updated {new Date(job.updatedAt).toLocaleTimeString()}</Text>
      </SurfaceCard>

      {job.state === 'failed' ? (
        <SurfaceCard bg="error.50" borderColor="error.200" accessibilityRole="alert" accessibilityLiveRegion="polite">
          <Heading color="error.800" fontSize="md">What happened</Heading>
          <Text color="error.800" fontSize="sm" mt={2}>{getGenerationErrorMessage(job.errorCode)}</Text>
          {job.errorCode === 'PROVIDER_FAILED' || job.errorCode === 'JOB_TIMEOUT' ? (
            <>
              <Button mt={4} rounded="xl" bg="moss" _pressed={{ bg: 'brand.700' }} onPress={() => retryDemoJob(job.id)} accessibilityLabel="Retry this same job without creating another charge">
                Retry same job
              </Button>
              <Text color="muted.600" fontSize="xs" mt={2}>Retry keeps the same job ID and idempotency key. The demo does not charge credits.</Text>
            </>
          ) : null}
          {job.errorCode && !['PROVIDER_FAILED', 'JOB_TIMEOUT'].includes(job.errorCode) ? (
            <Button mt={4} variant="outline" rounded="xl" onPress={handleFailureAction} accessibilityLabel="Open the next step for this error">
              {job.errorCode === 'INVALID_IMAGE' ? 'Edit photo' : job.errorCode === 'INSUFFICIENT_CREDITS' ? 'View plans' : 'Open profile'}
            </Button>
          ) : null}
        </SurfaceCard>
      ) : null}

      {job.state === 'completed' ? (
        <SurfaceCard>
          <Text color="ink" fontWeight="bold">Result preview comes next</Text>
          <Text color="muted.600" fontSize="sm" mt={1}>The P4 result screen will add the before/after view. This P3 completion is simulated and contains no provider image.</Text>
        </SurfaceCard>
      ) : null}

      <Box mt="auto">
        <VStack space={3}>
          {job.state === 'completed' ? (
            <Button rounded="2xl" bg="moss" _pressed={{ bg: 'brand.700' }} onPress={() => { closeProgress(); renewDraftId(); openCreation(); }} accessibilityLabel="Create another makeover from a new draft">
              Create another
            </Button>
          ) : null}
          {isPending || job.state === 'failed' ? (
            <Button variant="outline" rounded="2xl" onPress={() => setTab('home')} accessibilityLabel="Go Home and keep this job running">Continue browsing</Button>
          ) : null}
          {job.state === 'completed' ? (
            <Button variant="outline" rounded="2xl" onPress={() => setTab('home')} accessibilityLabel="Return Home">Return Home</Button>
          ) : null}
        </VStack>
      </Box>
    </VStack>
  );
}
