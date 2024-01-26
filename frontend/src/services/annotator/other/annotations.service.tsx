import { AnnotationType } from "../../../enum/annotation.enum.tsx";
import { Annotation } from "../../../interface/annotation.interface.tsx";
import { DefaultCrudService, useCrud } from "./default-crud.service.tsx";
import { useAnnotatorContext, useAnnotatorDispatch } from "../annotator.context.tsx";

export interface AnnotationsService extends DefaultCrudService<Annotation> {
  changeItemID: (currentID: number | undefined, newID: number) => void;
  prepare: (annotation: Annotation) => any;
  check: (annotations: Array<Annotation>) => void;
}

export const useAnnotations = (): AnnotationsService => {
  const context = useAnnotatorContext();
  const dispatch = useAnnotatorDispatch();

  const crud = useCrud<Annotation>('annotations');

  const changeItemID = (currentID: number | undefined, newID: number) => {
    dispatch!([{
      scope: 'annotations',
      type: 'changeItemID',
      currentID,
      newID
    }])
  }

  const focus = (item: Annotation) => {
    dispatch!([
      { scope: 'annotations', type: 'focus', item },
      {
        scope: 'comments',
        type: 'focus',
        item: item.result_comments.length > 0 ? item.result_comments[0] : {
          comment: '',
          annotation_task: context.task!.id,
          annotation_result: item.id ?? 0
        }
      },
      { scope: 'tags', type: 'focus', item: item.annotation },
      item.confidenceIndicator ? { scope: 'confidences', type: 'focus', item: item.confidenceIndicator } : {}
    ])
  }

  const blur = () => {
    dispatch!([
      { scope: 'annotations', type: 'blur' },
      { scope: 'comments', type: 'focus', item: context.comments.taskComment }
    ])
  }

  const prepare = (annotation: Annotation) => {
    const isBox = annotation.type === AnnotationType.box;
    const startTime = isBox ? annotation.startTime : null;
    const endTime = isBox ? annotation.endTime : null;
    const startFrequency = isBox ? annotation.startFrequency : null;
    const endFrequency = isBox ? annotation.endFrequency : null;
    const result_comments = annotation.result_comments.filter(c => c.comment.length > 0);
    return {
      id: annotation.id,
      startTime,
      endTime,
      annotation: annotation.annotation,
      startFrequency,
      endFrequency,
      confidenceIndicator: annotation.confidenceIndicator,
      result_comments: result_comments,
    };
  }

  const check = (annotations: Array<Annotation>) => {
    if (annotations.find(a => !a.annotation.length)) throw 'Make sure all your annotations are tagged.';
    if (context.task?.confidenceIndicatorSet && annotations.find(a => !a.confidenceIndicator?.length)) throw 'Make sure all your annotations have a confidence indicator.';
  }

  return {
    updateList: crud.updateList,
    update: crud.update,
    add: crud.add,
    remove: crud.remove,
    focus, blur,
    changeItemID, prepare, check }
}