// @flow
import React, { Component } from 'react';

import type { Annotation } from './AudioAnnotator';

// Component dimensions constants
const HEADER_HEIGHT: number = 18;
const HEADER_MARGIN: number = 3;

type RegionProps = {
  annotation: Annotation,
  color: string,
  timePxRatio: number,
  freqPxRatio: number,
  offsetTop: number,
  offsetLeft: number,
  onRegionDeleted: (Annotation) => void,
  onRegionMoved: (Annotation) => void,
  onRegionPlayed: (Annotation) => void,
  onRegionClicked: (Annotation) => void,
};

class Region extends Component<RegionProps> {

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
    const isActive: boolean = this.props.annotation.active;

    const duration: number = this.props.annotation.endTime - this.props.annotation.startTime;
    const freqRange: number = this.props.annotation.endFrequency - this.props.annotation.startFrequency;

    const width: number = Math.floor(this.props.timePxRatio * duration);
    const height: number = Math.floor(this.props.freqPxRatio * freqRange) + HEADER_HEIGHT + HEADER_MARGIN;

    const styles = {
      wrapper: {
        left: Math.floor(this.props.offsetLeft),
        top: Math.floor(this.props.offsetTop) - HEADER_HEIGHT - HEADER_MARGIN,
        width: width,
        height: height,
      },
      header: {
        height: HEADER_HEIGHT,
        marginBottom: HEADER_MARGIN,
        backgroundColor: isActive ? this.props.color : `${this.props.color}88`,
        border: isActive ? `2px solid ${this.props.color}` : `2px solid ${this.props.color}88`,
      },
      headerSpan: {
        height: `${HEADER_HEIGHT}px`,
      },
      body: {
        border: isActive ? `2px solid ${this.props.color}` : `2px solid ${this.props.color}88`,
        height: height - HEADER_HEIGHT - HEADER_MARGIN,
      },
    };

    return (
      <div
        className="region"
        style={styles.wrapper}
      >
        <p
          className="d-flex region-header"
          style={styles.header}
        >
          <button
            className="btn-simple fa fa-play-circle"
            onClick={this.playAnnotation}
          ></button>
          <span
            className="flex-fill text-center"
            onClick={this.selectAnnotation}
            style={styles.headerSpan}
          >{this.props.annotation.annotation}</span>
          <button
            className="btn-simple fa fa-times-circle"
            onClick={this.deleteAnnotation}
          ></button>
        </p>

        <div
          className="region-body"
          style={styles.body}
        ></div>
      </div>
    );
  }
}

export default Region;
