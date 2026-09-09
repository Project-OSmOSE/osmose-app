import React, { Fragment, useCallback } from 'react';
import { Kbd } from '@/components/ui';
import { useAudio } from './context';
import { Popover } from '@/components/base/Popover';
import { Pause, Play } from '@solar-icons/react';
import { useHotkey } from '@tanstack/react-hotkeys';

export const PlayPauseButton: React.FC = () => {
    const audio = useAudio()

    const toggle = useCallback(() => {
        switch (audio.state) {
            case 'play':
                audio.pause()
                break;
            case 'pause':
                audio.play();
                break;
        }
    }, [ audio ])
    useHotkey('Space', toggle)

    if (!audio.source) return <Fragment/>
    return <Popover.Root>
        <Popover.Trigger color="primary" onClick={ toggle }>
            { audio.state === 'pause' && <Play weight="Bold" size={ 20 }/> }
            { audio.state === 'play' && <Pause weight="Bold" size={ 20 }/> }
        </Popover.Trigger>
        <Popover.Content>
            <Popover.Title>Shortcut</Popover.Title>
            <Kbd keys="space"/> : Play/Pause audio
        </Popover.Content>
    </Popover.Root>
}