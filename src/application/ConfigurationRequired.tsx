import { Box, Heading, Text, VStack } from 'native-base';

export function ConfigurationRequired() {
  return (
    <Box flex={1} safeArea bg="paper" justifyContent="center" px={8}>
      <VStack space={3}>
        <Heading color="ink">Live services are not configured</Heading>
        <Text color="muted.600" fontSize="md">
          This build cannot run demo flows. Configure the approved live services
          before enabling the production experience.
        </Text>
      </VStack>
    </Box>
  );
}
