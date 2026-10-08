import { Badge, Box, Button, Heading, HStack, ScrollView, Text, VStack } from 'native-base';
import type { ReactNode } from 'react';
import { SurfaceCard } from '../components/SurfaceCard';
import { useGenerationStore } from '../stores/useGenerationStore';
import { useMakeoverDraftStore } from '../stores/useMakeoverDraftStore';
import { useNavigationStore } from '../stores/useNavigationStore';

function ScreenFrame({ children }: { children: ReactNode }) {
  return (
    <ScrollView flex={1} bg="paper" contentContainerStyle={{ flexGrow: 1 }}>
      <VStack px={5} pt={6} pb={8} space={5}>
        {children}
      </VStack>
    </ScrollView>
  );
}

function DemoHeader() {
  return (
    <HStack alignItems="center" justifyContent="space-between">
      <Text color="brand.700" fontSize="xs" fontWeight="bold" letterSpacing="lg">AI ROOM MAKEOVER</Text>
      <Badge colorScheme="warning" rounded="full" px={3} py={1} accessibilityLabel="Development demo mode">DEMO</Badge>
    </HStack>
  );
}

export function HomeScreen() {
  const identity = useNavigationStore((state) => state.identity);
  const openCreation = useNavigationStore((state) => state.openCreation);
  const openProgress = useNavigationStore((state) => state.openProgress);
  const setIdentity = useNavigationStore((state) => state.setIdentity);
  const activeJob = useGenerationStore((state) => state.jobs.find((job) => job.id === state.activeJobId) ?? null);
  const draftPhoto = useMakeoverDraftStore((state) => state.photo);
  const draftRoomType = useMakeoverDraftStore((state) => state.roomType);
  const draftStyle = useMakeoverDraftStore((state) => state.style);
  const draftHydrated = useMakeoverDraftStore((state) => state.hydrated);
  const hasDraft = Boolean(draftPhoto || draftRoomType || draftStyle);
  return (
    <ScreenFrame>
      <DemoHeader />
      <VStack space={4}>
        <Text color="moss" fontWeight="semibold">A little more room to feel at home</Text>
        <Heading color="ink" fontSize="3xl" lineHeight="sm">Make room for a new point of view.</Heading>
        <Text color="muted.600" fontSize="md" lineHeight="2xl">Refresh your room with a photo and a style that feels like you.</Text>
      </VStack>
      <Box bg="brand.100" rounded="3xl" minH={210} alignItems="center" justifyContent="center" px={8}>
        <Text fontSize="6xl" accessibilityLabel="Illustration of a calm room">⌂</Text>
        <Text color="brand.700" textAlign="center">Your room preview will appear here</Text>
      </Box>
      <SurfaceCard>
        <HStack justifyContent="space-between" alignItems="center">
          <VStack space={1} flex={1}>
            <Text color="ink" fontWeight="bold">{identity === 'guest' ? 'Free demo trial' : 'Demo account'}</Text>
            <Text color="muted.600" fontSize="sm">{identity === 'guest' ? 'Guest browsing · generation is added in a later feature.' : 'Signed-in state preview · no account service is connected.'}</Text>
          </VStack>
          <Badge colorScheme="success" rounded="full">{identity === 'guest' ? 'GUEST' : 'PREVIEW'}</Badge>
        </HStack>
      </SurfaceCard>
      {draftHydrated && hasDraft ? (
        <SurfaceCard accessibilityLabel="Saved makeover draft">
          <Text color="muted.600" fontSize="xs" fontWeight="bold">SAVED DRAFT</Text>
          <Text color="ink" fontWeight="semibold" mt={1}>{draftPhoto ? 'Room photo selected' : 'Choose a room photo'}</Text>
          <Text color="muted.600" fontSize="sm" mt={1}>{[draftRoomType, draftStyle].filter(Boolean).join(' · ') || 'Room and style still needed'}</Text>
          <Button mt={3} variant="outline" rounded="xl" onPress={openCreation} accessibilityLabel="Continue saved makeover draft">Continue draft</Button>
        </SurfaceCard>
      ) : null}
      {activeJob ? (
        <SurfaceCard accessibilityLabel={`Latest demo job status: ${activeJob.state}`}>
          <HStack alignItems="center" justifyContent="space-between">
            <VStack space={1} flex={1}>
              <Text color="muted.600" fontSize="xs" fontWeight="bold">LATEST DEMO JOB</Text>
              <Text color="ink" fontWeight="semibold" textTransform="capitalize">{activeJob.state}</Text>
              <Text color="muted.600" fontSize="sm">{activeJob.id}</Text>
            </VStack>
            <Button variant="outline" rounded="xl" onPress={openProgress} accessibilityLabel="Open latest demo job progress">View progress</Button>
          </HStack>
        </SurfaceCard>
      ) : null}
      <Button size="lg" rounded="2xl" bg="moss" _pressed={{ bg: 'brand.700' }} onPress={openCreation} accessibilityLabel="Start a room makeover demo">{hasDraft ? 'Continue your makeover' : 'Start a makeover'}</Button>
      <Button variant="outline" rounded="2xl" onPress={() => setIdentity(identity === 'guest' ? 'signed-in-preview' : 'guest')} accessibilityLabel="Switch demo identity preview">Preview {identity === 'guest' ? 'signed-in' : 'guest'} state</Button>
    </ScreenFrame>
  );
}

export function DesignsScreen() {
  const identity = useNavigationStore((state) => state.identity);
  const setIdentity = useNavigationStore((state) => state.setIdentity);
  return (
    <ScreenFrame>
      <DemoHeader />
      <VStack space={2}>
        <Heading color="ink" fontSize="3xl">My Designs</Heading>
        <Text color="muted.600">Your saved room ideas will live here.</Text>
      </VStack>
      {identity === 'guest' ? (
        <SurfaceCard>
          <Text fontSize="2xl" accessibilityLabel="Lock icon">⌑</Text>
          <Heading color="ink" fontSize="lg" mt={2}>Sign in to keep your designs</Heading>
          <Text color="muted.600" fontSize="sm" mt={2} lineHeight="lg">Sign-in will be connected in a later feature. This demo does not create or save an account.</Text>
          <Button mt={4} variant="outline" rounded="xl" onPress={() => setIdentity('signed-in-preview')} accessibilityLabel="Preview signed-in designs state">Preview signed-in state</Button>
        </SurfaceCard>
      ) : (
        <SurfaceCard>
          <Text color="muted.600" fontSize="sm">No saved designs yet. Saved design support is coming in a later feature.</Text>
        </SurfaceCard>
      )}
    </ScreenFrame>
  );
}

export function PlansScreen() {
  return (
    <ScreenFrame>
      <DemoHeader />
      <VStack space={2}>
        <Heading color="ink" fontSize="3xl">Plans</Heading>
        <Text color="muted.600">Explore what will be available when plans are connected.</Text>
      </VStack>
      <SurfaceCard>
        <Badge alignSelf="flex-start" colorScheme="warning" rounded="full">DEVELOPMENT EXAMPLE</Badge>
        <Heading color="ink" fontSize="xl" mt={3}>Plans are not available yet</Heading>
        <Text color="muted.600" fontSize="sm" mt={2} lineHeight="lg">Example credit packages are not approved prices or purchasable offers. No payment is taken in this demo.</Text>
      </SurfaceCard>
      <SurfaceCard>
        <Text color="ink" fontWeight="bold">Clear costs before you create</Text>
        <Text color="muted.600" fontSize="sm" mt={1}>When generation is added, the app will show its cost before you confirm.</Text>
      </SurfaceCard>
    </ScreenFrame>
  );
}

export function ProfileScreen() {
  const identity = useNavigationStore((state) => state.identity);
  const setIdentity = useNavigationStore((state) => state.setIdentity);
  return (
    <ScreenFrame>
      <DemoHeader />
      <VStack space={2}>
        <Heading color="ink" fontSize="3xl">Profile</Heading>
        <Text color="muted.600">Account and app settings.</Text>
      </VStack>
      <SurfaceCard>
        <Text color="muted.600" fontSize="xs" fontWeight="bold">CURRENT DEMO STATE</Text>
        <Text color="ink" fontWeight="semibold" mt={1}>{identity === 'guest' ? 'Guest' : 'Signed-in preview'}</Text>
        <Text color="muted.600" fontSize="sm" mt={2}>Authentication and account controls are not connected.</Text>
        <Button mt={4} variant="outline" rounded="xl" onPress={() => setIdentity(identity === 'guest' ? 'signed-in-preview' : 'guest')} accessibilityLabel="Switch between demo identity previews">Switch preview state</Button>
      </SurfaceCard>
      <SurfaceCard>
        <Text color="ink" fontWeight="semibold">Privacy first</Text>
        <Text color="muted.600" fontSize="sm" mt={1}>This demo does not upload room photos or store account data.</Text>
      </SurfaceCard>
    </ScreenFrame>
  );
}
