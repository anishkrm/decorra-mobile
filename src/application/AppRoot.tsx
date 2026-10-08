import { useEffect, useState } from 'react';
import { Button, HStack, Text, VStack } from 'native-base';
import { useRuntimeStore } from '../stores/useRuntimeStore';
import { useNavigationStore, type AppTab } from '../stores/useNavigationStore';
import { useGenerationStore } from '../stores/useGenerationStore';
import { UploadConfigureScreen } from '../screens/UploadConfigureScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { DesignsScreen, HomeScreen, PlansScreen, ProfileScreen } from '../screens/TabScreens';
import { ConfigurationRequired } from './ConfigurationRequired';

const tabs: { id: AppTab; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'designs', label: 'My Designs', icon: '▧' },
  { id: 'plans', label: 'Plans', icon: '◇' },
  { id: 'profile', label: 'Profile', icon: '○' },
];

export function AppRoot() {
  const mode = useRuntimeStore((state) => state.appMode);
  const activeTab = useNavigationStore((state) => state.activeTab);
  const setTab = useNavigationStore((state) => state.setTab);
  const creationOpen = useNavigationStore((state) => state.creationOpen);
  const progressOpen = useNavigationStore((state) => state.progressOpen);
  const openProgress = useNavigationStore((state) => state.openProgress);
  const jobsHydrated = useGenerationStore((state) => state.hydrated);
  const activeJob = useGenerationStore((state) => state.jobs.find((job) => job.id === state.activeJobId) ?? null);
  const [recoveryHandled, setRecoveryHandled] = useState(false);

  useEffect(() => {
    if (!jobsHydrated || recoveryHandled) return;
    setRecoveryHandled(true);
    if (activeJob?.state === 'queued' || activeJob?.state === 'processing') openProgress();
  }, [activeJob, jobsHydrated, openProgress, recoveryHandled]);

  if (mode !== 'demo') return <ConfigurationRequired />;
  const screen = progressOpen ? <ProgressScreen /> : creationOpen ? <UploadConfigureScreen /> : {
    home: <HomeScreen />,
    designs: <DesignsScreen />,
    plans: <PlansScreen />,
    profile: <ProfileScreen />,
  }[activeTab];

  return (
    <VStack flex={1} bg="paper" safeArea>
      {screen}
      <HStack bg="white" borderTopWidth={1} borderColor="brand.100" px={1} py={1} justifyContent="space-around" accessibilityRole="tablist">
        {tabs.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              flex={1}
              variant="ghost"
              px={1}
              py={2}
              rounded="xl"
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={`${tab.label} tab${selected ? ', selected' : ''}`}
              onPress={() => setTab(tab.id)}
            >
              <VStack alignItems="center" space={0}>
                <Text color={selected ? 'moss' : 'muted.500'} fontSize="lg">{tab.icon}</Text>
                <Text color={selected ? 'moss' : 'muted.500'} fontSize="2xs" fontWeight={selected ? 'bold' : 'medium'}>{tab.label}</Text>
              </VStack>
            </Button>
          );
        })}
      </HStack>
    </VStack>
  );
}
