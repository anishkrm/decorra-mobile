import { Box, type IBoxProps } from 'native-base';
import type { PropsWithChildren } from 'react';

type SurfaceCardProps = PropsWithChildren<IBoxProps>;

export function SurfaceCard({ children, ...props }: SurfaceCardProps) {
  return (
    <Box
      bg="white"
      borderColor="brand.100"
      borderWidth={1}
      rounded="2xl"
      p={5}
      shadow={1}
      {...props}
    >
      {children}
    </Box>
  );
}
