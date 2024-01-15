import React from "react";
import { ProvideAnnotator } from "../../services/annotator/annotator.provider.tsx";
import { AudioPlayer } from "./audio-player.component.tsx";
import { AnnotatorHeader } from "./annotator-header.component.tsx";
import { AudioAnnotatorToolbar } from "./audio-annotator-toolbar.component.tsx";
import { CurrentAnnotationBloc } from "./current-annotation-bloc.component.tsx";
import { TagListBloc } from "./tag-list-bloc.component.tsx";

import { PresenceBloc } from "./presence-bloc.component.tsx";


export const AudioAnnotator: React.FC = () => {

  return (
    <ProvideAnnotator>
      <div className="annotator container-fluid ps-0">

        <AnnotatorHeader/>

        <AudioPlayer/>

        {/* Workbench (spectrogram viz, box drawing) */ }

        <AudioAnnotatorToolbar/>

        {/* Tag and annotations management */ }
        <div className="row justify-content-around m-2">
          <CurrentAnnotationBloc/>

          <div className="col-5 flex-shrink-2">
            <TagListBloc/>

            {/* Confidence Indicator management */ }
            {/*{ task.confidenceIndicatorSet && currentDefaultTagAnnotation &&*/ }
            {/*    <ConfidenceIndicatorBloc set={ task.confidenceIndicatorSet }*/ }
            {/*                             currentIndicator={ currentDefaultTagAnnotation }*/ }
            {/*                             onIndicatorSelected={ toggleAnnotationConfidence }></ConfidenceIndicatorBloc> }*/ }
          </div>

          <PresenceBloc/>
        </div>

        {/*<div className="row justify-content-center">*/ }
        {/*  <AnnotationList annotations={ annotations }*/ }
        {/*                  annotationMode={ task.annotationScope }*/ }
        {/*                  onAnnotationClicked={ activateAnnotation }></AnnotationList>*/ }

        {/*  <CommentBloc currentComment={ currentComment }*/ }
        {/*               taskComment={ taskComment }*/ }
        {/*               onCommentUpdated={ setCurrentComment }*/ }
        {/*               onFocusUpdated={ setInModal }*/ }
        {/*               onSubmit={ submitCommentAndAnnotation }*/ }
        {/*               switchToTaskComment={ switchToTaskComment }></CommentBloc>*/ }
        {/*</div>*/ }
      </div>
    </ProvideAnnotator>
  )
}