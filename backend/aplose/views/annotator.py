"""Annotator viewset"""

# pylint: disable=protected-access


# TODO: test !!!! and update result post ones
# class AnnotatorViewSet(viewsets.ViewSet):
#     """Annotator viewset"""
#
#     @action(
#         methods=["GET"],
#         detail=False,
#         url_path="campaign/(?P<campaign_id>[^/.]+)/phase/(?P<phase_id>[^/.]+)/file/(?P<file_id>[^/.]+)",
#         url_name="campaign-file",
#     )
#     def get_file(self, request: Request, campaign_id: int, phase_id: int, file_id: int):
#         # pylint: disable=too-many-locals
#         """Get all data for annotator"""
#
#         campaign = AnnotationCampaign.objects.get(pk=campaign_id)
#         file = DatasetFile.objects.get(pk=file_id)
#         file_ranges = AnnotationFileRange.objects.filter(
#             annotation_campaign_phase_id=phase_id,
#             annotator_id=request.user.id,
#         )
#         is_assigned = (
#             campaign.archive is None
#             and file_ranges.filter(
#                 from_datetime__gte=file.start,
#                 to_datetime__lte=file.end,
#             ).exists()
#         )
#         filtered_files = AnnotationFileRangeFilesFilter().filter_queryset(
#             request, file_ranges, self
#         )
#
#         # User previous results
#         results = []
#         task_comments = []
#         current_task_index = 0
#         current_task_index_in_filter = 0
#         next_file = None
#         previous_file = None
#         total_tasks = 0
#         total_tasks_in_filter = 0
#         if is_assigned:
#             total_tasks_in_filter = filtered_files.count()
#             request._request.GET = {
#                 "for_phase": phase_id,
#                 "dataset_file_id": file_id,
#                 "for_current_user": True,
#             }
#             results = AnnotationResultViewSet.as_view({"get": "list"})(
#                 request._request
#             ).data
#             request._request.GET = {
#                 "annotation_campaign_phase_id": phase_id,
#                 "dataset_file_id": file_id,
#                 "annotation_result__isnull": True,
#                 "for_current_user": True,
#             }
#             task_comments = AnnotationCommentViewSet.as_view({"get": "list"})(
#                 request._request
#             ).data
#
#             current_file = DatasetFile.objects.get(pk=file_id)
#
#             min_datetime = min(file_ranges.values_list("from_datetime", flat=True))
#             max_datetime = max(file_ranges.values_list("to_datetime", flat=True))
#
#             all_files = DatasetFile.objects.filter(
#                 dataset__annotation_campaigns=campaign_id,
#                 id__gte=min_datetime,
#                 id__lte=max_datetime,
#             )
#             total_tasks = all_files.count()
#
#             previous_file: DatasetFile = filtered_files.filter(
#                 Q(start__lt=current_file.start)
#                 | Q(start=current_file.start, id__lt=current_file.id)
#             ).last()
#             next_file = filtered_files.filter(
#                 Q(start__gt=current_file.start)
#                 | Q(start=current_file.start, id__gt=current_file.id)
#             ).first()
#
#             index_filter = Q(start__lt=current_file.start) | Q(
#                 start=current_file.start, id__lt=current_file.id
#             )
#
#             current_task_index_in_filter = filtered_files.filter(index_filter).count()
#             current_task_index = all_files.filter(index_filter).count()
#
#         return Response(
#             {
#                 "current_task_index_in_filter": current_task_index_in_filter,
#                 "total_tasks_in_filter": total_tasks_in_filter,
#                 "current_task_index": current_task_index,
#                 "total_tasks": total_tasks,
#                 "is_submitted": AnnotationTask.objects.filter(
#                     annotation_campaign_phase_id=phase_id,
#                     dataset_file_id=file_id,
#                     annotator_id=request.user.id,
#                     status=AnnotationTask.Status.FINISHED,
#                 ).exists(),
#                 "file": DatasetFileViewSet.as_view({"get": "retrieve"})(
#                     request._request,
#                     pk=file_id,
#                 ).data,
#                 "results": results,
#                 "task_comments": task_comments,
#                 "previous_file_id": previous_file.id
#                 if previous_file is not None
#                 else None,
#                 "next_file_id": next_file.id if next_file is not None else None,
#                 "is_assigned": is_assigned,
#             },
#             status=status.HTTP_200_OK,
#         )
#
#     @action(
#         methods=["POST"],
#         detail=False,
#         url_path="campaign/(?P<campaign_id>[^/.]+)/phase/(?P<phase_id>[^/.]+)/file/(?P<file_id>[^/.]+)",
#         url_name="campaign-file-post",
#     )
#     @transaction.atomic()
#     def post(self, request: Request, campaign_id: int, phase_id: int, file_id: int):
#         """Post all data for annotator"""
#
#         # Check permission
#         phase = get_object_or_404(
#             AnnotationCampaignPhase,
#             pk=phase_id,
#             annotation_campaign_id=campaign_id,
#         )
#         file = get_object_or_404(DatasetFile, id=file_id)
#         file_ranges = phase.file_ranges.filter(annotator_id=request.user.id)
#         if not file_ranges.exists():
#             return Response(status=status.HTTP_403_FORBIDDEN)
#         all_files = []
#         for file_range in file_ranges:
#             all_files += list(DatasetFile.objects.filter_for_file_range(file_range))
#         if file not in all_files:
#             return Response(status=status.HTTP_403_FORBIDDEN)
#
#         # Update
#         results = AnnotationResultViewSet.update_results(
#             request.data.get("results") or [], phase, file, request.user.id
#         )
#         comments = AnnotationCommentViewSet.update_comments(
#             request.data.get("task_comments") or [],
#             phase,
#             file,
#             request.user.id,
#         )
#
#         task, _ = AnnotationTask.objects.get_or_create(
#             annotator=request.user,
#             annotation_campaign_phase_id=phase_id,
#             dataset_file_id=file_id,
#         )
#         task.status = AnnotationTask.Status.FINISHED
#         task.save()
#         if phase.phase == Phase.ANNOTATION:
#             # Mark as unsubmitted verification task of other users on this file
#             AnnotationTask.objects.filter(
#                 annotation_campaign_phase__annotation_campaign=phase.annotation_campaign,
#                 annotation_campaign_phase__phase=Phase.VERIFICATION,
#                 dataset_file_id=file_id,
#             ).filter(~Q(annotator=request.user)).update(
#                 status=AnnotationTask.Status.CREATED
#             )
#         session_serializer = AnnotationSessionSerializer(
#             data={
#                 **request.data["session"],
#                 "annotation_task": task.id,
#                 "session_output": {
#                     "results": request.data.get("results"),
#                     "task_comments": request.data.get("task_comments"),
#                 },
#             }
#         )
#         session_serializer.is_valid(raise_exception=True)
#         session_serializer.save()
#
#         return Response(
#             {
#                 "results": results,
#                 "task_comments": comments,
#             },
#             status=status.HTTP_200_OK,
#         )
