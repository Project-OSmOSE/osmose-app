import React from 'react';

import './styles.css';

export const People: React.FC = () => {
  return (
    <div className="people">
      <h2>People</h2>

      <section>
        <h3>ODE: Ocean Data Explorer</h3>
        <p>Develop all the computer technology used to manage and process Data (at scale with speed and in context, naturally Big).</p>
        <h4>Members</h4>
        <ul>
          <li>Joseph Allemandou</li>
          <li>Alexandre Degurse</li>
          <li>Erwan Keribin</li>
          <li>Romain Vovard</li>
        </ul>
      </section>

      <section>
        <h3>AIE</h3>
        <p>Develop all the computer technology used to make computers learn and recognize ocean sounds like humans (like whales or shrimps should be better?)</p>
        <h4>Members</h4>
        <ul>
          <li>Dorian Cazau</li>
          <li>Léa Bouffaut</li>
          <li>Richard Dréo</li>
          <li>Paul Nguyen Hong Duc</li>
        </ul>
      </section>

      <section>
        <h3>Underwater Passive Acoustics Sciences</h3>
        <p>Do all the ocean science based on UPA (mainly about whale monitoring and conservation for the moment but we never know)</p>
        <h4>Members</h4>
        <ul>
          <li>Olivier Adam</li>
          <li>Julie Beesau</li>
          <li>Fabio Cassiano</li>
          <li>Yann Doh</li>
          <li>Rémi Emmetiere</li>
          <li>Emmanuelle Leroy</li>
          <li>Delphine Mathias</li>
          <li>Gaetan Richard</li>
          <li>Flore Samaran</li>
          <li>Maelle Torterotot</li>
          <li>Youenn Jézéquel</li>
        </ul>
      </section>
    </div>
  );
}
