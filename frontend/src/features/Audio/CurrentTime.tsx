import React, { useMemo } from 'react';
import { formatTime } from '@/service/function';
import { useAudio } from './context';
import { NBSP } from '@/service/type';
import { Note } from '@/components/base';

export const CurrentTime: React.FC = () => {
  const { time: _time, duration: _duration, source } = useAudio()
  const time = useMemo(() => formatTime(_time, (_duration ?? 0) < 60), [ _time, _duration ])
  const duration = useMemo(() => formatTime(_duration), [ _duration ])

  if (!source) return <Note data>--{ NBSP }/{ NBSP }{ duration }</Note>
  return <Note data>{ time }{ NBSP }/{ NBSP }{ duration }</Note>
}
