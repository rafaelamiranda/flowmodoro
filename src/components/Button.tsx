import { Button as ChakraButton } from '@chakra-ui/react';
import React, { ReactElement, MouseEvent } from 'react';

interface ButtonComponentProps {
  id: string;
  icon?: ReactElement;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  colorScheme?: string;
  children: React.ReactNode;
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({ id, icon, onClick, colorScheme, children }) => {
  return (
    <ChakraButton id={id} leftIcon={icon} colorScheme={colorScheme} onClick={onClick} marginLeft={4}>
      {children}
    </ChakraButton>
  );
};

export default ButtonComponent;
