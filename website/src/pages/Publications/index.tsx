import {PageTitle} from "../../components/PageTitle";

import imgTitle from '../../img/illust/pexels-element-digital-1370295_thin.webp';

export const Publications: React.FC = () => {

  return (
    <div id="publications-page">
      <PageTitle
        img={imgTitle}
        imgAlt="Publications Banner"
      >
        <h1 className="text-shadow">SCIENTIFIC PUBLICATIONS</h1>
      </PageTitle>

      <div className="container">
        <section className="my-5">
          <h2>Peer reviewed articles</h2>

          <ul>
            <li>
              <strong>G. Dubus, M. Torterotot, P. N. H. Duc, J. Beesau, D. Cazau</strong> and O. Adam. Better quantifying inter-annotator variability: A step towards citizen science in underwater passive acoustics. <em>OCEANS 2023 - Limerick</em>, Limerick, Ireland, pp. 1-8.
            </li>
            <li>
              <strong>Torterotot, M., Beesau</strong>, J., Perrier de la Bathie, C., & <strong>Samaran, F.</strong> (2022). Assessing marine mammal diversity in remote Indian Ocean regions, using an acoustic glider. <em>Deep Sea Research Part II: Topical Studies in Oceanography</em>, 206. <a href="https://doi.org/10.1016/j.dsr2.2022.105204" target="_blank" rel="noreferrer">Link</a>
            </li>
          </ul>
        </section>

        <section className="my-5">
          <h2>Conferences</h2>

          <ul>
            <li>
              <strong>Michel, M., Béesau, J., Torterotot, M., Samaran, F.</strong> (2023) Less is more? How the choice of a recording duty cycle could affect monitoring results of passive acoustic studies on cetaceans. <em>34th European Cetacean Society annual conference</em>, O’Grove, Spain. <a href="https://www.researchgate.net/publication/370637739_Less_is_more_How_the_choice_of_a_recording_duty_cycle_could_affect_monitoring_results_of_passive_acoustic_studies_on_cetaceans" target="_blank" rel="noreferrer">Link</a>
            </li>
            <li>
              <strong>Dupont, M., Béesau, J., Torterotot</strong>, M., Loirat, V., Lagarde, V., <strong>Samaran, F.</strong> (2023) Using passive acoustic to better understand dolphins' behaviour around fishing nets in bycatch context. <em>34th European Cetacean Society annual conference</em>, O’Grove, Spain. <a href="https://www.researchgate.net/publication/374088531_Using_passive_acoustic_to_better_understand_dolphins'_behaviour_around_fishing_nets_in_bycatch_context" target="_blank" rel="noreferrer">Link</a>
            </li>
            <li>
              <strong>G. Dubus, M. Torterotot, P. N. H. Duc, J. Beesau, D. Cazau</strong> and O. Adam. Better quantifying inter-annotator variability: A step towards citizen science in underwater passive acoustics. <em>IEEE OCEANS</em> 2023. Limerick, Ireland.
            </li>
            <li>
              <strong>G. Dubus, D. Cazau, M. Torterotot, J. Béesau</strong> and O. Adam. Citizen science involved in detection and classification of cetaceans for passive acoustic monitoring. <em>Humpback Whale World Congress</em> 2023, Santo Domingo, Dominican Republic.
              </li>
            <li>
              <strong>Michel, M., Torterotot, M., Samaran, F.</strong> Effet du sous-échantillonnage temporel : le cas des données acoustiques de grandes baleines dans l’océan Indien. <em>SERENADE</em> 2022, Brest, France.
            </li>
            <li>
              <strong>Cazau, D., .Dubus, G., Torterotot, M., Beesau, J., Samaran, F.</strong> News about OSMOSE: a scientific interest group on methods and applications around underwater passive acoustics. <em>SERENADE</em> 2022, Brest, France.
            </li>
            <li>
              <strong>Samaran, F., Torterotot, M., Beesau</strong>, J., Gicquel, C. ,CETIROISE – Mise en place d’un observatoire acoustique des cétacés au sein du Parc naturel marin d’Iroise 2021-2023. <em>SERENADE</em> 2022, Brest, France.
            </li>
            <li>
              <strong>Torterotot, M., Beesau, J., Samaran, F.</strong> Calling from nowhere: Assessing marine mammal diversity around St Paul and Amsterdam Islands (Indian Ocean) using an acoustic glider. <em>24th biennial Conference on the Biology of Marine Mammals</em> 2021, Palm Beach, USA.
            </li>
            <li>
              <strong>Torterotot, M., Samaran, F., Beesau, J., Cazau, D., .Dubus, G., Nguyen Hong Duc, P.</strong> APLOSE : a web-based annotation platform to assist collaborative annotation campaigns on passive acoustics datasets.
            </li>
          </ul>
          <br/>
        </section>
      </div>
    </div>
  );
};
