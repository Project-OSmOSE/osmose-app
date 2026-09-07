import React from 'react';
import { Dialog, type DialogCloseProps as BaseProps } from '@base-ui/react/dialog';
import { Button, type ButtonProps } from '@/components/base/Button';

export type DialogCloseProps = Omit<BaseProps, 'render'> & ButtonProps

export const Close: React.FC<DialogCloseProps> = (props) => (
    <Dialog.Close render={ <Button/> } { ...props }/>
)
