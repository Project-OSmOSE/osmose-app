export function providesTagsForList<Type extends {id: number | string}, Tag>(type: Tag, result?: Type[]) {
  return [ type, ...(result ?? []).map(r => ({ type, id: r.id })) ]
}