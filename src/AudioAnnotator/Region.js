// @flow
import React, { Component } from 'react';

import type { Annotation } from './AudioAnnotator';

// Component dimensions constants
const HEADER_HEIGHT: number = 18;
const HEADER_MARGIN: number = 3;

type RegionProps = {
  annotation: Annotation,
  timePxRatio: number,
  freqPxRatio: number,
  offsetTop: number,
  offsetLeft: number,
  onRegionDeleted: (Annotation) => void,
  onRegionMoved: (Annotation) => void,
  onRegionPlayed: (Annotation) => void,
  onRegionClicked: (Annotation) => void,
};

type RegionState = {
  left: number,
  top: number,
  width: number,
  height: number,
};

class Region extends Component<RegionProps, RegionState> {
  constructor(props: RegionProps) {
    super(props);

    const duration: number = props.annotation.endTime - props.annotation.startTime;
    const freqRange: number = props.annotation.endFrequency - props.annotation.startFrequency;

    const width: number = Math.floor(this.props.timePxRatio * duration);
    const height: number = Math.floor(this.props.freqPxRatio * freqRange) + HEADER_HEIGHT + HEADER_MARGIN;

    this.state = {
      left : Math.floor(this.props.offsetLeft),
      top: Math.floor(this.props.offsetTop) - HEADER_HEIGHT - HEADER_MARGIN,
      width,
      height,
    };
  }

  playAnnotation = () => {
    this.props.onRegionPlayed(this.props.annotation);
  }

  deleteAnnotation = () => {
    this.props.onRegionDeleted(this.props.annotation);
  }

  selectAnnotation = () => {
    this.props.onRegionClicked(this.props.annotation);
  }

  render() {
    const styles = {
      wrapper: {
        left: this.state.left,
        top: this.state.top,
        width: this.state.width,
        height: this.state.height,
      },
      header: {
        height: HEADER_HEIGHT,
        marginBottom: HEADER_MARGIN,
      },
      body: {
        height: this.state.height - HEADER_HEIGHT - HEADER_MARGIN,
      },
    };

    const activeClass = this.props.annotation.active ? "active" : "inactive";

    return (
      <div
        className="region"
        style={styles.wrapper}
      >
        <p
          className={`d-flex region-header region-header--${activeClass}`}
          style={styles.header}
        >
          <button
            className="btn-simple fa fa-play-circle"
            onClick={this.playAnnotation}
          ></button>
          <span
            className="flex-fill text-center"
            onClick={this.selectAnnotation}
          >{this.props.annotation.annotation}</span>
          <button
            className="btn-simple fa fa-times-circle"
            onClick={this.deleteAnnotation}
          ></button>
        </p>

        <div
          className={`region-body region-body--${activeClass}`}
          style={styles.body}
        ></div>
      </div>
    );
  }
}

export default Region;
