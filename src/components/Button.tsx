import { Button as ChakraButton } from '@chakra-ui/react';
import React, { ReactElement, MouseEvent } from 'react';

interface ButtonComponentProps {
  icon?: ReactElement;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  colorScheme?: string;
  children: React.ReactNode;
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({ icon, onClick, colorScheme, children }) => {
  return (
    <ChakraButton leftIcon={icon} colorScheme={colorScheme} onClick={onClick} marginLeft={4}>
      {children}
    </ChakraButton>
  );
};

export default ButtonComponent;
