import { Button, useColorMode } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import React from 'react';

const DarkModeSwitch: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Button onClick={toggleColorMode} variant="ghost" aria-label="Toggle Dark Mode">
      {colorMode === 'light' ? (
        <MoonIcon w={6} h={6} transition="color 0.2s" />
      ) : (
        <SunIcon w={6} h={6} color="orange.300" transition="color 0.2s" />
      )}
    </Button>
  );
}

export default DarkModeSwitch;
