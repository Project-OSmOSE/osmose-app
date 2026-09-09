import React, { useCallback } from 'react';
import styles from './styles.module.scss';
import { Bloc } from '@/components/ui';
import { LabelChip } from './LabelChip';
import { useAppDispatch, useAppSelector } from '@/features/App';
import { selectHiddenLabels } from './selectors';
import { blur } from '@/features/Annotator/Annotation';
import { setHiddenLabels } from './slice';
import { useLoaderData } from '@tanstack/react-router';
import { Button } from '@/components/base/Button';
import { useHotkey } from '@tanstack/react-hotkeys';

export const LabelsBloc: React.FC = () => {
    const { labels } = useLoaderData({ from: '/_authenticated/annotation-campaign/$campaignID' })
    const hiddenLabels = useAppSelector(selectHiddenLabels)
    const dispatch = useAppDispatch()

    const showAllLabels = useCallback(() => {
        dispatch(setHiddenLabels([]))
    }, [ dispatch ])

    const escape = useCallback(() => dispatch(blur()), [ dispatch ])
    useHotkey('Escape', escape)

    return <Bloc.Root className={ styles.labels }>
        <Bloc.Title>
            Labels
            { hiddenLabels.length > 0 && <Button onClick={ showAllLabels }
                                                 className={ styles.showButton }>Show all</Button> }
        </Bloc.Title>
        <Bloc.Content>
            { labels.map((label) => <LabelChip label={ label.name } key={ label.id }/>) }
        </Bloc.Content>
    </Bloc.Root>
}
