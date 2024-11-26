import reducer, { AnnotationActions, AnnotationsSlice } from "@/slices/annotator/annotations.ts";
import { AnnotationComment, AnnotationResult, AnnotationResultBounds } from "@/services/api";

const mockState: AnnotationsSlice = {
  hasChanged: false,
  results: [
    {
      "id": 1,
      "label": "Mysticetes",
      "confidence_indicator": "not confident",
      "annotator": 1,
      "dataset_file": 1,
      "detector_configuration": null,
      "start_time": null,
      "end_time": null,
      "start_frequency": null,
      "end_frequency": null,
      "comments": [
        {
          "id": 1568,
          "annotation_result": 1,
          "annotation_campaign": 1,
          "author": 1,
          "dataset_file": 1,
          "comment": "a comment : Mysticetes"
        }
      ],
      "validations": [ {
        is_valid: false,
        result: 1,
        annotator: 1,
        id: 1
      } ],
      "annotation_campaign": 1
    },
    {
      "id": 2,
      "label": "Mysticetes",
      "confidence_indicator": "not confident",
      "annotator": 1,
      "dataset_file": 1,
      "detector_configuration": null,
      "start_time": 288.0,
      "end_time": 331.0,
      "start_frequency": 8179.0,
      "end_frequency": 11593.0,
      "comments": [
        {
          "id": 1569,
          "annotation_result": 2,
          "annotation_campaign": 1,
          "author": 1,
          "dataset_file": 1,
          "comment": "a second comment : Mysticetes"
        }
      ],
      "validations": [],
      "annotation_campaign": 1
    }
  ],
  focusedResult: undefined,

  labelSet: {
    "id": 1,
    "name": "Test SPM campaign",
    "desc": "Label set made for Test SPM campaign",
    "labels": [
      "Mysticetes",
      "Odoncetes",
      "Boat",
      "Rain",
      "Other"
    ]
  },
  labelColors: {
    Mysticetes: "#00b1b9",
    Odoncetes: "#a23b72",
    Boat: "#f18f01",
    Rain: "#c73e1d",
    Other: "#bb7e5d",
  },
  presenceLabels: [ "Mysticetes" ],
  focusedLabel: undefined,

  confidenceSet: {
    "id": 1,
    "name": "Confident/NotConfident",
    "desc": "Occur box voice student night argue wind. Play street let buy life offer situation. Term perhaps final give something cut cover. Article ready whose call black purpose. Everybody under we generation service week hold produce. Kid put language.",
    "confidence_indicators": [
      {
        "id": 2,
        "label": "confident",
        "level": 1,
        "isDefault": true
      },
      {
        "id": 1,
        "label": "not confident",
        "level": 0,
        "isDefault": false
      }
    ]
  },
  focusedConfidence: "confident",

  focusedComment:
    {
      "id": 1,
      "annotation_result": null,
      "annotation_campaign": 1,
      "author": 1,
      "dataset_file": 1,
      "comment": "a comment"
    },
  taskComments: [
    {
      "id": 1,
      "annotation_result": null,
      "annotation_campaign": 1,
      "author": 1,
      "dataset_file": 1,
      "comment": "a comment"
    }
  ],
}
const newPresence: string = "Boat";
const newBoxResult: AnnotationResultBounds = {
  "start_time": 10.0,
  "end_time": 20.0,
  "start_frequency": 50.0,
  "end_frequency": 12000.0,
}


describe("Empty state", () => {
  test("Should initialize", () => {
    const previousState = undefined;
    const response = reducer(previousState, AnnotationActions.init({
      results: mockState.results,
      task_comments: mockState.taskComments,
      confidence_set: mockState.confidenceSet!,
      label_set: mockState.labelSet!,
    }))
    expect(response).toEqual(mockState);
  })
})

describe("Filled state - not focused result", () => {
  const previousState = { ...mockState, focusedLabel: 'Boat', focusedConfidence: 'not confident' };

  test("Should focus result", () => {
    const response = reducer(previousState, AnnotationActions.focusResult(mockState.results[0]));
    expect(response.focusedResult).toEqual(mockState.results[0]);
    expect(response.focusedLabel).toEqual(mockState.results[0].label);
    expect(response.focusedConfidence).toEqual(mockState.results[0].confidence_indicator);
    expect(response.focusedComment).toEqual(mockState.results[0].comments[0]);
  })

  test("Should add result", () => {
    const response = reducer(previousState, AnnotationActions.addResult(newBoxResult));
    const expectedNewResult: AnnotationResult = {
      ...newBoxResult,
      id: -1,
      label: previousState.focusedLabel!,
      confidence_indicator: previousState.focusedConfidence ?? null,
      comments: [],
      validations: [],
      annotator: -1,
      annotation_campaign: -1,
      dataset_file: -1,
      detector_configuration: null
    }
    expect(response.focusedResult).toEqual(expectedNewResult);
    expect(response.results).toContainEqual(expectedNewResult);
    expect(response.focusedLabel).toEqual(previousState.focusedLabel);
    expect(response.focusedConfidence).toEqual(previousState.focusedConfidence);
    expect(response.focusedComment).toEqual(undefined);
  })

  test("Should remove box result", () => {
    const response = reducer(previousState, AnnotationActions.removeResult(mockState.results[1]));
    expect(response.focusedResult).toEqual(mockState.results[0]);
    expect(response.results).not.toContainEqual(mockState.results[1]);
    expect(response.focusedLabel).toEqual(mockState.results[0].label);
    expect(response.focusedConfidence).toEqual(mockState.results[0].confidence_indicator);
    expect(response.focusedComment).toEqual(mockState.results[0].comments[0]);
  })

  test("Should remove presence result", () => {
    const response = reducer(previousState, AnnotationActions.removeResult(mockState.results[0]));
    expect(response.focusedResult).toEqual(undefined);
    expect(response.results).toEqual([]);
    expect(response.focusedLabel).toEqual(undefined);
    expect(response.focusedConfidence).toEqual(previousState.focusedConfidence);
    expect(response.focusedComment).toEqual(mockState.taskComments[0]);
  })

  test("Should focus task", () => {
    const response = reducer(previousState, AnnotationActions.focusTask());
    expect(response.focusedResult).toEqual(undefined);
    expect(response.results).toEqual(mockState.results);
    expect(response.focusedLabel).toEqual(undefined);
    expect(response.focusedConfidence).toEqual("confident");
    expect(response.focusedComment).toEqual(mockState.taskComments[0]);
  })

  test("Should update focus comment", () => {
    const response = reducer(previousState, AnnotationActions.updateFocusComment("hello"));
    const expectedComment: AnnotationComment = {
      ...mockState.taskComments[0],
      comment: 'hello'
    }
    expect(response.focusedResult).toEqual(undefined);
    expect(response.focusedComment).toEqual(expectedComment);
    expect(response.taskComments).toEqual([ expectedComment ]);
  })

  test("Should remove focus comment", () => {
    const response = reducer(previousState, AnnotationActions.removeFocusComment());
    expect(response.focusedResult).toEqual(undefined);
    expect(response.focusedComment).toEqual(undefined);
    expect(response.taskComments).toEqual([]);
  })

  test("Should add presence", () => {
    const response = reducer(previousState, AnnotationActions.addPresence(newPresence));
    const expectedNewResult: AnnotationResult = {
      id: -1,
      start_frequency: null,
      start_time: null,
      end_frequency: null,
      end_time: null,
      label: newPresence,
      confidence_indicator: previousState.focusedConfidence ?? null,
      comments: [],
      validations: [],
      annotator: -1,
      annotation_campaign: -1,
      dataset_file: -1,
      detector_configuration: null
    }
    expect(response.focusedResult).toEqual(expectedNewResult);
    expect(response.results).toContainEqual(expectedNewResult);
    expect(response.focusedLabel).toEqual(newPresence);
    expect(response.focusedConfidence).toEqual(previousState.focusedConfidence);
    expect(response.focusedComment).toEqual(undefined);
  })

  test("Should focus known presence", () => {
    const response = reducer(previousState, AnnotationActions.focusLabel("Mysticete"));
    expect(response).toEqual({
      ...previousState,
      focusedLabel: "Mysticete"
    })
  })

  test("Should remove presence", () => {
    const response = reducer(previousState, AnnotationActions.removePresence("Mysticetes"));
    expect(response.focusedResult).toEqual(undefined);
    expect(response.results).toEqual([]);
    expect(response.focusedLabel).toEqual(undefined);
    expect(response.focusedConfidence).toEqual(previousState.focusedConfidence);
    expect(response.focusedComment).toEqual(mockState.taskComments[0]);
  })

  test("Should validate presence", () => {
    const response = reducer(previousState, AnnotationActions.validateResult(mockState.results[0]));
    const expectedResult: AnnotationResult = {
      ...mockState.results[0],
      validations: [ {
        ...mockState.results[0].validations[0],
        is_valid: true,
      } ]
    }
    expect(response.focusedResult).toEqual(expectedResult);
    expect(response.results).toContainEqual(expectedResult);
    expect(response.focusedLabel).toEqual(mockState.results[0].label);
    expect(response.focusedConfidence).toEqual(previousState.focusedConfidence);
    expect(response.focusedComment).toEqual(mockState.results[0].comments[0]);
  })

  test("Should invalidate presence", () => {
    const response = reducer(previousState, AnnotationActions.invalidateResult(mockState.results[0]));
    const expectedResult: AnnotationResult = {
      ...mockState.results[0],
      validations: [ {
        ...mockState.results[0].validations[0],
        is_valid: false,
      } ]
    }
    const expectedBoxResult: AnnotationResult = {
      ...mockState.results[1],
      validations: [ {
        is_valid: false,
        result: mockState.results[1].id,
        id: -1,
        annotator: -1,
      } ]
    }
    expect(response.focusedResult).toEqual(expectedResult);
    expect(response.results).toContainEqual(expectedResult);
    expect(response.results).toContainEqual(expectedBoxResult);
    expect(response.focusedLabel).toEqual(mockState.results[0].label);
    expect(response.focusedConfidence).toEqual(previousState.focusedConfidence);
    expect(response.focusedComment).toEqual(mockState.results[0].comments[0]);
  })

  test("Should validate box", () => {
    const response = reducer(previousState, AnnotationActions.validateResult(mockState.results[1]));
    const expectedResult: AnnotationResult = {
      ...mockState.results[1],
      validations: [ {
        is_valid: true,
        result: mockState.results[1].id,
        id: -1,
        annotator: -1,
      } ]
    }
    const expectedPresenceResult: AnnotationResult = {
      ...mockState.results[0],
      validations: [ {
        ...mockState.results[0].validations[0],
        is_valid: true,
      } ]
    }
    expect(response.focusedResult).toEqual(expectedResult);
    expect(response.results).toContainEqual(expectedResult);
    expect(response.results).toContainEqual(expectedPresenceResult);
    expect(response.focusedLabel).toEqual(mockState.results[1].label);
    expect(response.focusedConfidence).toEqual(previousState.focusedConfidence);
    expect(response.focusedComment).toEqual(mockState.results[1].comments[0]);
  })

  test("Should invalidate box", () => {
    const response = reducer(previousState, AnnotationActions.invalidateResult(mockState.results[1]));
    const expectedResult: AnnotationResult = {
      ...mockState.results[1],
      validations: [ {
        is_valid: false,
        result: mockState.results[1].id,
        id: -1,
        annotator: -1,
      } ]
    }
    expect(response.focusedResult).toEqual(expectedResult);
    expect(response.results).toContainEqual(expectedResult);
    expect(response.focusedLabel).toEqual(mockState.results[1].label);
    expect(response.focusedConfidence).toEqual(previousState.focusedConfidence);
    expect(response.focusedComment).toEqual(mockState.results[1].comments[0]);
  })

  test("Should update confidence", () => {
    const response = reducer(previousState, AnnotationActions.selectConfidence("confident"));
    expect(response.focusedResult).toEqual(previousState.focusedResult);
    expect(response.results).toEqual(previousState.results);
    expect(response.focusedLabel).toEqual(previousState.focusedLabel);
    expect(response.focusedConfidence).toEqual("confident");
    expect(response.focusedComment).toEqual(previousState.focusedComment);
  })

})

describe("Filled state - presence focused result", () => {
  const previousState = {
    ...mockState,
    focusedResult: mockState.results[0],
    focusedLabel: mockState.results[0].label,
    focusedConfidence: mockState.results[0].confidence_indicator!,
    focusedComment: mockState.results[0].comments[0]
  };

  test("Should focus result", () => {
    const response = reducer(previousState, AnnotationActions.focusResult(mockState.results[1]));
    expect(response.focusedResult).toEqual(mockState.results[1]);
    expect(response.focusedLabel).toEqual(mockState.results[1].label);
    expect(response.focusedConfidence).toEqual(mockState.results[1].confidence_indicator);
    expect(response.focusedComment).toEqual(mockState.results[1].comments[0]);
  })

  test("Should update focus comment", () => {
    const response = reducer(previousState, AnnotationActions.updateFocusComment("hello"));
    const expectedComment: AnnotationComment = {
      ...mockState.results[0].comments[0],
      comment: 'hello'
    }
    const expectedResult: AnnotationResult = {
      ...mockState.results[0],
      comments: [ expectedComment ]
    }
    expect(response.focusedComment).toEqual(expectedComment);
    expect(response.focusedResult).toEqual(expectedResult);
    expect(response.results).toContainEqual(expectedResult);
    expect(response.taskComments).toEqual(previousState.taskComments);
  })

  test("Should remove focus comment", () => {
    const response = reducer(previousState, AnnotationActions.removeFocusComment());
    const expectedResult: AnnotationResult = {
      ...mockState.results[0],
      comments: []
    }
    expect(response.focusedComment).toEqual(undefined);
    expect(response.focusedResult).toEqual(expectedResult);
    expect(response.results).toContainEqual(expectedResult);
    expect(response.taskComments).toEqual(previousState.taskComments);
  })

  test("Should focus label", () => {
    const response = reducer(previousState, AnnotationActions.focusLabel("Boat"));
    expect(response.focusedResult).toEqual(undefined);
    expect(response.results).toEqual(mockState.results);
    expect(response.focusedLabel).toEqual("Boat");
    expect(response.focusedConfidence).toEqual("confident");
    expect(response.focusedComment).toEqual(mockState.taskComments[0]);
  })

  test("Should update confidence", () => {
    const response = reducer(previousState, AnnotationActions.selectConfidence("confident"));
    const expectedResult: AnnotationResult = {
      ...previousState.focusedResult,
      confidence_indicator: "confident"
    }
    expect(response.focusedResult).toEqual(expectedResult);
    expect(response.results).toContainEqual(expectedResult);
    expect(response.focusedLabel).toEqual(previousState.focusedLabel);
    expect(response.focusedConfidence).toEqual("confident");
    expect(response.focusedComment).toEqual(previousState.focusedComment);
  })

})

describe("Filled state - box focused result", () => {
  const previousState = {
    ...mockState,
    focusedResult: mockState.results[1],
    focusedLabel: mockState.results[1].label,
    focusedConfidence: mockState.results[1].confidence_indicator!,
    focusedComment: mockState.results[1].comments[0]
  };

  test("Should focus result", () => {
    const response = reducer(previousState, AnnotationActions.focusResult(mockState.results[0]));
    expect(response.focusedResult).toEqual(mockState.results[0]);
    expect(response.focusedLabel).toEqual(mockState.results[0].label);
    expect(response.focusedConfidence).toEqual(mockState.results[0].confidence_indicator);
    expect(response.focusedComment).toEqual(mockState.results[0].comments[0]);
  })

  test("Should update focus comment", () => {
    const response = reducer(previousState, AnnotationActions.updateFocusComment("hello"));
    const expectedComment: AnnotationComment = {
      ...mockState.results[1].comments[0],
      comment: 'hello'
    }
    const expectedResult: AnnotationResult = {
      ...mockState.results[1],
      comments: [ expectedComment ]
    }
    expect(response.focusedComment).toEqual(expectedComment);
    expect(response.focusedResult).toEqual(expectedResult);
    expect(response.results).toContainEqual(expectedResult);
    expect(response.taskComments).toEqual(previousState.taskComments);
  })

  test("Should remove focus comment", () => {
    const response = reducer(previousState, AnnotationActions.removeFocusComment());
    const expectedResult: AnnotationResult = {
      ...mockState.results[1],
      comments: []
    }
    expect(response.focusedComment).toEqual(undefined);
    expect(response.focusedResult).toEqual(expectedResult);
    expect(response.results).toContainEqual(expectedResult);
    expect(response.taskComments).toEqual(previousState.taskComments);
  })

  test("Should focus label", () => {
    const response = reducer(previousState, AnnotationActions.focusLabel("Boat"));
    const expectedResult: AnnotationResult = {
      ...previousState.focusedResult,
      label: 'Boat'
    }
    expect(response.focusedResult).toEqual(expectedResult);
    expect(response.results).toContainEqual(expectedResult);
    expect(response.focusedLabel).toEqual("Boat");
    expect(response.focusedConfidence).toEqual("not confident");
    expect(response.focusedComment).toEqual(expectedResult.comments[0]);
  })

  test("Should update confidence", () => {
    const response = reducer(previousState, AnnotationActions.selectConfidence("confident"));
    const expectedResult: AnnotationResult = {
      ...previousState.focusedResult,
      confidence_indicator: "confident"
    }
    expect(response.focusedResult).toEqual(expectedResult);
    expect(response.results).toContainEqual(expectedResult);
    expect(response.focusedLabel).toEqual(previousState.focusedLabel);
    expect(response.focusedConfidence).toEqual("confident");
    expect(response.focusedComment).toEqual(previousState.focusedComment);
  })

})
