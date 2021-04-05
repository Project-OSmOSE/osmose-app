import React from 'react';

import './styles.css';

export const Project: React.FC = () => {
  return (
    <div className="project">
      <h2>Project overview</h2>

      <section>
        <h3>What do we want to achieve?</h3>
        <p><strong>
          Facilitating<sup>1</sup> interactions between the different Underwater Passive Acoustics actors to achive more collaborative<sup>2</sup> works.
        </strong></p>
        <ol>
          <li>through open sciences and active collaboration on one (Science) side, and developing big data oriented and web based tools on the other (Technology) side;</li>
          <li>i.e. tend to the FAIR principles.</li>
        </ol>
      </section>

      <section>
        <h3>How do we do it step-by-step?</h3>
        <ol>
          <li>
            Starting with a Community question, dealing with specific methodological aspects upstream scientific applications.<br />
            An example: "What is the variability of low-level descriptors in soundscape analysis?"
          </li>
          <li>
            Answering first with Science meetings to establish a study plan and find agreements between experts on how this question should be answered;
          </li>
          <li>
            Then, this study plan may need for Technology development.<br />
            Driven by scientific needs, designed for collaborative open sciences and big data, provided with methodological descriptives and user guides, performance evaluation through computational benchmarks.
          </li>
          <li>
            Eventually, answers are provided through Numerical experimentations.<br />
            Data-driver, large-scale and comparative.
          </li>
        </ol>
      </section>
    </div>
  );
}
