import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import React, { ReactElement, MouseEvent, ForwardedRef, forwardRef } from 'react';

interface ButtonComponentProps extends Omit<ChakraButtonProps, 'children' | 'onClick'> {
  id: string;
  icon?: ReactElement; 
  onClick: (event: MouseEvent<HTMLButtonElement>) => void; 
  children: React.ReactNode; 
  ariaLabel: string; 
}

const ButtonComponent = forwardRef<HTMLButtonElement, ButtonComponentProps>(
  ({ id, icon, onClick, colorScheme, children, ariaLabel, ...props }, ref: ForwardedRef<HTMLButtonElement>) => {
    return (
      <ChakraButton
        id={id} 
        ref={ref} 
        leftIcon={icon} 
        colorScheme={colorScheme} 
        onClick={onClick} 
        marginLeft={4} 
        aria-label={ariaLabel} 
        {...props}
      >
        {children}
      </ChakraButton>
    );
  }
);

ButtonComponent.displayName = 'ButtonComponent'; 
export default ButtonComponent;
