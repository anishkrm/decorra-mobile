import { Badge, Box, HStack, Heading, Text, VStack } from 'native-base';

export function DemoHome() {
  return (
    <Box flex={1} safeArea bg="paper" px={6} py={8}>
      <VStack flex={1} justifyContent="space-between" space={8}>
        <HStack alignItems="center" justifyContent="space-between">
          <Text color="ink" fontSize="sm" fontWeight="semibold">
            AI ROOM MAKEOVER
          </Text>
          <Badge colorScheme="warning" rounded="full" px={3} py={1}>
            DEVELOPMENT DEMO
          </Badge>
        </HStack>

        <VStack space={5}>
          <Box
            bg="brand.100"
            rounded="3xl"
            minH={260}
            justifyContent="center"
            alignItems="center"
            px={8}
          >
            <Text fontSize="6xl" accessibilityLabel="A simple room illustration">
              ◡
            </Text>
            <Text color="brand.700" fontSize="sm" textAlign="center">
              Your room refresh starts with one photo
            </Text>
          </Box>

          <VStack space={3}>
            <Heading color="ink" fontSize="3xl" lineHeight="sm">
              Make room for a new point of view.
            </Heading>
            <Text color="muted.600" fontSize="md" lineHeight="2xl">
              This development build is the app foundation. Photo upload,
              sign-in, AI generation, and purchases will be added in later
              feature branches.
            </Text>
          </VStack>
        </VStack>

        <Box bg="white" borderColor="brand.200" borderWidth={1} p={4} rounded="2xl">
          <Text color="brand.700" fontWeight="semibold">
            Demo mode is isolated
          </Text>
          <Text color="muted.600" fontSize="sm" mt={1}>
            No photos are uploaded and no purchase or credit is created here.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
