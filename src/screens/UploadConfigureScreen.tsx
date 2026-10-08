import { useState } from 'react';
import { Alert, Image, Linking, TextInput } from 'react-native';
import { Badge, Box, Button, Heading, HStack, ScrollView, Text, VStack } from 'native-base';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { SurfaceCard } from '../components/SurfaceCard';
import type { GenerationRequest, InteriorStyle, RoomType } from '../services/contracts';
import { validatePickedImage } from '../services/imageValidation';
import { useGenerationStore, type DemoScenario } from '../stores/useGenerationStore';
import { useMakeoverDraftStore, type DraftPhoto } from '../stores/useMakeoverDraftStore';
import { useNavigationStore } from '../stores/useNavigationStore';

const roomOptions: { id: RoomType; label: string }[] = [
  { id: 'living-room', label: 'Living room' },
  { id: 'bedroom', label: 'Bedroom' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'dining-room', label: 'Dining room' },
  { id: 'office', label: 'Office' },
  { id: 'bathroom', label: 'Bathroom' },
];

const styleOptions: { id: InteriorStyle; label: string }[] = [
  { id: 'modern', label: 'Modern' },
  { id: 'minimalist', label: 'Minimalist' },
  { id: 'scandinavian', label: 'Scandinavian' },
  { id: 'industrial', label: 'Industrial' },
  { id: 'bohemian', label: 'Bohemian' },
  { id: 'luxury', label: 'Luxury' },
];

type SelectionOption = { id: string; label: string };

function SwipeOptionCarousel<T extends SelectionOption>({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: T[];
  selected: string | null;
  onSelect: (id: T['id']) => void;
}) {
  return (
    <SurfaceCard p={4}>
      <HStack alignItems="center" justifyContent="space-between">
        <Heading color="ink" fontSize="lg">{title} <Text color="brand.600" fontSize="sm">Required</Text></Heading>
        <Text color="muted.500" fontSize="sm" accessibilityLabel="Swipe horizontally to see more options">‹  ›</Text>
      </HStack>
      <Text color="muted.600" fontSize="xs" mt={1} mb={3}>Swipe left or right to explore, then tap to select.</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        snapToInterval={170}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={{ paddingRight: 8 }}
        accessibilityLabel={`${title} options. Swipe horizontally.`}
      >
        <HStack space={3}>
          {options.map((option) => {
            const isSelected = selected === option.id;
            return (
              <Button
                key={option.id}
                width={158}
                minH={94}
                px={3}
                py={3}
                bg={isSelected ? 'brand.100' : 'white'}
                borderWidth={isSelected ? 2 : 1}
                borderColor={isSelected ? 'moss' : 'brand.200'}
                rounded="2xl"
                onPress={() => onSelect(option.id as T['id'])}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`${option.label}${isSelected ? ', selected' : ''}`}
              >
                <VStack width="100%" space={2} alignItems="flex-start">
                  <Text color={isSelected ? 'moss' : 'muted.500'} fontSize="xs" fontWeight="bold">
                    {isSelected ? 'SELECTED' : 'TAP TO CHOOSE'}
                  </Text>
                  <Text color="ink" fontSize="md" fontWeight="semibold" textAlign="left" numberOfLines={2}>
                    {option.label}
                  </Text>
                </VStack>
              </Button>
            );
          })}
        </HStack>
      </ScrollView>
    </SurfaceCard>
  );
}

async function removeDraftFile(uri: string | undefined) {
  if (!uri || !uri.startsWith(Paths.document.uri) || !uri.includes('room-makeover-draft-')) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // A missing draft file is recovered as a removable selection in the UI.
  }
}

export function UploadConfigureScreen() {
  const identity = useNavigationStore((state) => state.identity);
  const openProgress = useNavigationStore((state) => state.openProgress);
  const photo = useMakeoverDraftStore((state) => state.photo);
  const roomType = useMakeoverDraftStore((state) => state.roomType);
  const style = useMakeoverDraftStore((state) => state.style);
  const instructions = useMakeoverDraftStore((state) => state.instructions);
  const preparedAt = useMakeoverDraftStore((state) => state.preparedAt);
  const setPhoto = useMakeoverDraftStore((state) => state.setPhoto);
  const setRoomType = useMakeoverDraftStore((state) => state.setRoomType);
  const setStyle = useMakeoverDraftStore((state) => state.setStyle);
  const setInstructions = useMakeoverDraftStore((state) => state.setInstructions);
  const setPreparedAt = useMakeoverDraftStore((state) => state.setPreparedAt);
  const draftId = useMakeoverDraftStore((state) => state.draftId);
  const beginDemoJob = useGenerationStore((state) => state.beginDemoJob);
  const [error, setError] = useState<string | null>(null);
  const [permissionSettings, setPermissionSettings] = useState(false);
  const [busy, setBusy] = useState(false);
  let photoFileAvailable = false;
  if (photo) {
    try {
      photoFileAvailable = new File(photo.uri).exists;
    } catch {
      photoFileAvailable = false;
    }
  }

  const chooseAsset = async (source: 'gallery' | 'camera') => {
    setError(null);
    setPermissionSettings(false);
    setBusy(true);
    try {
      let result: ImagePicker.ImagePickerResult;
      if (source === 'gallery') {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 1,
          exif: false,
        });
      } else {
        let permission = await ImagePicker.getCameraPermissionsAsync();
        if (!permission.granted && permission.canAskAgain) {
          permission = await ImagePicker.requestCameraPermissionsAsync();
        }
        if (!permission.granted) {
          setPermissionSettings(!permission.canAskAgain);
          setError('Camera access is off. Allow camera access in Settings or choose a photo from your library.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 1,
          exif: false,
        });
      }

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) {
        setError('No photo was returned. Please try again.');
        return;
      }

      const sourceFile = new File(asset.uri);
      const fileInfo = sourceFile.info();
      const validation = validatePickedImage(asset, fileInfo.size);
      if (!validation.ok) {
        setError(validation.message);
        return;
      }

      const savedName = `room-makeover-draft-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}.${validation.image.extension}`;
      const destination = new File(Paths.document, savedName);
      await sourceFile.copy(destination);
      const saved: DraftPhoto = {
        uri: destination.uri,
        fileName: savedName,
        mimeType: validation.image.mimeType,
        sizeBytes: validation.image.sizeBytes,
        width: validation.image.width,
        height: validation.image.height,
      };
      await removeDraftFile(photo?.uri);
      setPhoto(saved);
    } catch {
      setError(source === 'camera'
        ? 'The camera could not open on this device. Try the photo library or another device.'
        : 'The photo picker could not open. Check your device settings and try again.');
    } finally {
      setBusy(false);
    }
  };

  const explainAndChoose = (source: 'gallery' | 'camera') => {
    const isCamera = source === 'camera';
    Alert.alert(
      isCamera ? 'Use your camera' : 'Choose a room photo',
      isCamera
        ? 'Camera access is used only when you take a room photo for this makeover draft.'
        : 'You choose the room photo. The app only receives the item you select; it is not uploaded in this demo.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: isCamera ? 'Continue' : 'Choose photo', onPress: () => { void chooseAsset(source); } },
      ],
    );
  };

  const clearPhoto = () => {
    Alert.alert('Remove this photo?', 'Your other draft choices will be kept.', [
      { text: 'Keep photo', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
        void removeDraftFile(photo?.uri);
        setPhoto(null);
        setError(null);
      } },
    ]);
  };

  const startDemoRequest = async (scenario: DemoScenario) => {
    if (!photo) {
      setError('Choose a room photo before continuing.');
      return;
    }
    if (!photoFileAvailable) {
      setError('This photo is no longer available. Remove it and choose it again before continuing.');
      return;
    }
    if (!roomType || !style) {
      setError('Choose a room type and a style before continuing.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const request: GenerationRequest = {
        sourceUri: photo.uri,
        roomType,
        style,
        instructions: instructions.trim() || undefined,
        idempotencyKey: draftId,
      };
      await beginDemoJob(request, draftId, scenario);
      setPreparedAt(new Date().toISOString());
      openProgress();
    } catch {
      setError('The demo job could not be saved. Check available device storage and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <VStack flex={1} bg="paper">
      <ScrollView flex={1} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <VStack px={5} pt={4} pb={5} space={4}>
        <HStack alignItems="center" justifyContent="space-between">
          <Text color="brand.700" fontSize="xs" fontWeight="bold" letterSpacing="lg">AI ROOM MAKEOVER</Text>
          <Badge colorScheme="warning" rounded="full" px={3} py={1}>DEVELOPMENT DEMO</Badge>
        </HStack>
        <VStack space={2}>
          <Heading color="ink" fontSize="3xl">Upload and configure</Heading>
          <Text color="muted.600" lineHeight="2xl">Choose a room photo and describe the look you want. This draft stays on this device.</Text>
        </VStack>

        <SurfaceCard>
          <Heading color="ink" fontSize="lg">Your room photo</Heading>
          <Text color="muted.600" fontSize="sm" mt={1} lineHeight="lg">JPEG, PNG, WebP, HEIC, or HEIF · up to 20 MB · 512–12,000 px per side</Text>
          {photo ? (
            <VStack space={3} mt={4}>
              {photoFileAvailable ? (
              <Box rounded="2xl" overflow="hidden" bg="brand.100" height={190}>
                  <Image source={{ uri: photo.uri }} resizeMode="cover" style={{ width: '100%', height: '100%' }} accessibilityLabel={`Selected room photo, ${photo.width} by ${photo.height} pixels`} />
                </Box>
              ) : (
                <Box rounded="xl" bg="warning.100" p={3} accessibilityRole="alert">
                  <Text color="warning.800" fontSize="sm">This photo is no longer available. Remove it and choose it again.</Text>
                </Box>
              )}
              <Text color="muted.600" fontSize="sm">{photo.fileName} · {(photo.sizeBytes / (1024 * 1024)).toFixed(1)} MB</Text>
              <HStack space={3}>
                <Button flex={1} variant="outline" rounded="xl" onPress={() => explainAndChoose('gallery')} isDisabled={busy} accessibilityLabel="Replace room photo">Replace</Button>
                <Button flex={1} variant="ghost" rounded="xl" onPress={clearPhoto} accessibilityLabel="Remove room photo">Remove</Button>
              </HStack>
            </VStack>
          ) : (
            <HStack space={3} mt={4}>
              <Button flex={1} rounded="xl" bg="moss" _pressed={{ bg: 'brand.700' }} onPress={() => explainAndChoose('gallery')} isDisabled={busy} accessibilityLabel="Choose a room photo from the photo library">Choose photo</Button>
              <Button flex={1} variant="outline" rounded="xl" onPress={() => explainAndChoose('camera')} isDisabled={busy} accessibilityLabel="Take a room photo with the camera">Take photo</Button>
            </HStack>
          )}
        </SurfaceCard>

        <SwipeOptionCarousel
          title="Room type"
          options={roomOptions}
          selected={roomType}
          onSelect={setRoomType}
        />

        <SwipeOptionCarousel
          title="Style"
          options={styleOptions}
          selected={style}
          onSelect={setStyle}
        />

        <SurfaceCard>
          <Heading color="ink" fontSize="lg">Anything else? <Text color="muted.500" fontSize="sm">Optional</Text></Heading>
          <Text color="muted.600" fontSize="sm" mt={1}>Add a few details such as colors or pieces you want to keep.</Text>
          <TextInput
            value={instructions}
            onChangeText={setInstructions}
            maxLength={500}
            multiline
            textAlignVertical="top"
            placeholder="For example: keep the sofa and use warm wood tones"
            accessibilityLabel="Optional makeover instructions"
            style={{ minHeight: 112, marginTop: 12, padding: 14, borderWidth: 1, borderColor: '#D7C7B1', borderRadius: 12, backgroundColor: '#FBF9F5', color: '#292821', fontSize: 16, lineHeight: 24 }}
          />
          <Text color="muted.500" fontSize="xs" textAlign="right" mt={1}>{instructions.length}/500</Text>
        </SurfaceCard>

        {preparedAt ? (
          <SurfaceCard accessibilityLabel="Demo request is ready">
            <Text color="moss" fontWeight="bold">Draft ready for the next step</Text>
            <Text color="muted.600" fontSize="sm" mt={1}>Saved locally at {new Date(preparedAt).toLocaleString()}.</Text>
          </SurfaceCard>
        ) : null}

        {error ? (
          <SurfaceCard bg="error.50" borderColor="error.200" accessibilityRole="alert" accessibilityLiveRegion="polite">
            <Text color="error.800" fontWeight="semibold">{error}</Text>
            {permissionSettings ? <Button mt={3} variant="outline" onPress={() => { void Linking.openSettings(); }} accessibilityLabel="Open app permission settings">Open Settings</Button> : null}
          </SurfaceCard>
        ) : null}

      </VStack>
      </ScrollView>
      <Box bg="white" px={5} pt={3} pb={3} borderTopWidth={1} borderColor="brand.100">
        <HStack alignItems="center" justifyContent="space-between" mb={2}>
          <VStack flex={1} space={0}>
            <Text color="ink" fontWeight="bold">{identity === 'guest' ? 'Free demo trial · 0 credits' : '5 credits per new generation'}</Text>
            <Text color="muted.600" fontSize="xs">{identity === 'guest' ? 'Trial eligibility is not verified.' : 'Example cost only; balance is not connected.'}</Text>
          </VStack>
          <Badge colorScheme="warning" rounded="full">DEMO ONLY</Badge>
        </HStack>
        {(!photoFileAvailable || !roomType || !style) ? (
          <Text color="muted.600" fontSize="xs" mb={2}>
            {!photoFileAvailable && photo ? 'Choose the photo again. ' : !photo ? 'Choose a photo. ' : ''}
            {!roomType ? 'Choose a room type. ' : ''}{!style ? 'Choose a style.' : ''}
          </Text>
        ) : null}
        <Button size="lg" rounded="2xl" bg="moss" _pressed={{ bg: 'brand.700' }} onPress={() => { void startDemoRequest('success'); }} isDisabled={busy || !photoFileAvailable || !roomType || !style} accessibilityLabel="Start simulated demo progress without uploading or generating">
          {busy ? 'Saving demo job…' : 'Start demo generation'}
        </Button>
        <Button variant="ghost" size="sm" onPress={() => { void startDemoRequest('fail-first-attempt'); }} isDisabled={busy || !photoFileAvailable || !roomType || !style} accessibilityLabel="Simulate a provider failure and retry the same demo job">
          Preview failure and retry
        </Button>
        <Text color="muted.500" fontSize="2xs" textAlign="center">No photo is uploaded and no AI provider or credit system is used.</Text>
      </Box>
    </VStack>
  );
}
