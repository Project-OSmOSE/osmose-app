import {PageTitle} from "../../components/PageTitle";

import imgTitle from '../../img/illust/pexels-element-digital-1370295_thin.webp';

export const Publications: React.FC = () => {
  return (
    <div>
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
              G. Dubus, M. Torterotot, P. N. H. Duc, J. Beesau, D. Cazau and O. Adam, "Better quantifying inter-annotator variability: A step towards citizen science in underwater passive acoustics," OCEANS 2023 - Limerick, Limerick, Ireland, 2023, pp. 1-8
            </li>
            <li>
              Torterotot, M., Beesau, J., Perrier de la Bathie, C., & Samaran, F. (2022). <a href="https://doi.org/10.1016/j.dsr2.2022.105204">Assessing marine mammal diversity in remote Indian Ocean regions , using an acoustic glider.</a> Deep Sea Research Part II: Topical Studies in Oceanography, 206.
            </li>
          </ul>
        </section>

        <section className="my-5">
          <h2>Conference</h2>
            <ul>
              <li>G. Dubus, D. Cazau, M. Torterotot, J. Béesau and O. Adam. Citizen science involved in detection and classification of cetaceans for passive acoustic monitoring. Humpback Whale World Congress 2023. Santo Domingo, Dominican Republic.</li>
              <li>Michel, M.,  Torterotot, M., Samaran, F. Effet du sous-échantillonnage temporel : le cas des données acoustiques de grandes baleines dans l’océan Indien. SERENADE 2022, Brest.</li>
              <li>Cazau, D., .Dubus, G., Torterotot, M., Beesau, J., Samaran, F. News about OSMOSE: a scientific interest group on methods and applications around underwater passive acoustics. SERENADE 2022, Brest.</li>
              <li>Samaran, F., Torterotot, M., Beesau, J., Gicquel, C. ,CETIROISE – Mise en place d’un observatoire acoustique des cétacés au sein du Parc naturel marin d’Iroise 2021-2023. SERENADE 2022, Brest.</li>
              <li>Torterotot, M., Beesau, J., Samaran, F. Calling from nowhere: Assessing marine mammal diversity around St Paul and Amsterdam Islands (Indian Ocean) using an acoustic glider. 24th biennial Conference on the Biology of Marine Mammals 2021, Palm Beach, USA.</li>
              <li>Torterotot, M., Samaran, F., Beesau, J., Cazau, D., .Dubus, G., Nguyen Hong Duc, P.,  APLOSE : a web-based annotation platform to assist collaborative annotation campaigns on passive acoustics datasets</li>
          </ul>
          <br/>
        </section>
      </div>
    </div>
  );
};
