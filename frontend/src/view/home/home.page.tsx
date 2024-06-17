import React, { useEffect, useState } from "react";
import './home.page.css';
import { PageTitle } from "../../components/PageTitle";
import { CollaboratorsBanner } from "../../components/CollaboratorsBanner/CollaboratorsBanner";
import { Collaborator } from "../../interface/collaborator";
import { useFetchArray } from "../../services/api/utils";
import imgTitle from "../../img/illust/Content_head.jpg";
import step1 from "../../img/illust/etape1.png";
import step2 from "../../img/illust/etape2.png";
import step3 from "../../img/illust/etape3.png";
import step4 from "../../img/illust/etape4.png";
import step5 from "../../img/illust/etape5.png";
import step6 from "../../img/illust/etape6.png";
import step7 from "../../img/illust/etape7.png";
import imgGlider from "../../img/illust/GIF.gif";
import video from "../../img/illust/démo_APLOSE.mp4";

export const Home: React.FC = () => {
    const trainingImages = [step1, step2, step3, step4, step5, step6, step7];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [zoomedImageIndex, setZoomedImageIndex] = useState<number | null>(null);
    const [collaborators, setCollaborators] = useState<Array<Collaborator> | undefined>();

    const fetchCollaborators = useFetchArray<Array<Collaborator>>('/api/collaborators/on_aplose_home/');

    const nextSlide = () => {
        if (zoomedImageIndex === null) {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % trainingImages.length);
        }
    };

    const prevSlide = () => {
        if (zoomedImageIndex === null) {
            setCurrentImageIndex((prevIndex) => (prevIndex - 1 + trainingImages.length) % trainingImages.length);
        }
    };

    const toggleZoom = (index: number) => {
        setZoomedImageIndex(zoomedImageIndex === index ? null : index);
    };

    useEffect(() => {
        let isMounted = true;
        fetchCollaborators().then(collaborators => isMounted && setCollaborators(collaborators));

        return () => {
            isMounted = false;
        }
    },[]);

    return (
        <div id="aplose-page">
            <PageTitle img={imgTitle} imgAlt="Aplose Page Banner">APLOSE</PageTitle>
            <div className="section-content">
                <h2 className="title">Welcome to the overview page for APLOSE: Annotation Platform for Ocean Sound Explorers</h2>
                <p>
                    APLOSE is the OSmOSE team platform for marine acoustic research. It is an open-source annotation platform that facilitates collaboration in the field of underwater acoustics.
                    Dive into our short video presentation to find out more about APLOSE.
                </p>
                <div className="video-section">
                    <video controls className="video-full-width">
                        <source src={video} type="video/mp4" />
                    </video>
                </div>
            </div>

            <div className="section-content">
                <h2>Manual annotation of marine sounds</h2>
                <p>
                    Manual annotation is the action of assigning labels on spectrograms (time/frequency representation of the sound) of a dataset. A dataset is made of audio files that will be annotated by one or several annotators during an annotation campaign.
                    These audio files can be divided into smaller audio segments, depending on the sounds of interest. An annotation task is a spectrogram and its matching audio segment associated with a set of labels from which the annotator must choose to make the annotations. Labels are tags that designate the sounds to search on the spectrogram.
                    They can describe broad categories of sound (biophony, geophony, anthropophony), groups of species (odontocetes, black fish, etc) or more specific types of sound (air gun, blue whale D-calls, etc). Within an annotation campaign, each annotator is given a list of annotation tasks to accomplish. There are 2 classes of annotation: weak annotation,
                    the annotator annotates the whole spectrogram from the list of available labels ; and strong annotation, the annotator draws a labeled time-frequency box around the targeted sound event.
                </p>
                <img src={imgGlider} alt="Glider" className="full-width-margin-top" />
            </div>

            <div className="section-content">
                <h2>Platform features</h2>
                <p>
                    Explore the core functionalities of APLOSE through detailed screenshots that illustrate how our platform operates. Among other, APLOSE allows to:
                </p>
                <ul>
                    <li>Visualize and zoom on pre-computed spectrograms :</li>
                    <li>Play the sound at different speeds</li>
                    <li>Add custom labels on the whole spectrogram or draw boxes around the sounds</li>
                    <li>Specify a confidence indicator on each annotation</li>
                    <li>Add comments on each annotation</li>
                    <li>Easily download the results in a CSV format</li>
                </ul>

                <div className="carousel-container">
                    <button className="carousel-control left" onClick={prevSlide} disabled={zoomedImageIndex !== null}>
                        &lt;
                    </button>
                    <div className="carousel-wrapper" style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
                        {trainingImages.map((img, index) => (
                            <div key={index} className="carousel-slide">
                                <img
                                    src={img}
                                    alt={`Training Resource ${index + 1}`}
                                    className={`carousel-image ${zoomedImageIndex === index ? 'zoomed' : ''}`}
                                    onClick={() => toggleZoom(index)}
                                />
                            </div>
                        ))}
                    </div>
                    <button className="carousel-control right" onClick={nextSlide} disabled={zoomedImageIndex !== null}>
                        &gt;
                    </button>
                </div>

                {zoomedImageIndex !== null && (
                    <div className="zoom-overlay" onClick={() => setZoomedImageIndex(null)}>
                        <img
                            src={trainingImages[zoomedImageIndex]}
                            alt={`Zoomed Training Resource ${zoomedImageIndex + 1}`}
                            className="zoomed-image"
                        />
                    </div>
                )}
            </div>

            <div className="section-content">
                <h2>Resources and training</h2>
                <p>
                    To ensure all new users can effectively exploit APLOSE, we offer a range of tutorials and training documents. These resources are designed to help you quickly become proficient in navigating the interface and using the available tools.
                </p>
                <div className="section-content">
                    <a href="https://github.com/Project-OSmOSE/osmose-app/wiki/Annotator-User-Guide" target="_blank">Annotator user guide</a> / <a href="/app/images/campagne.pdf" target="_blank" rel="noopener noreferrer">Annotation Campaign APOCADO</a>
                </div>
            </div>

            <div className="section-content">
                <h2>Collaboration and open source</h2>
                <p>
                    APLOSE platform was used in several research projects involving citizen science with the Astrolabe Expeditions organization <a href="https://www.astrolabe-expeditions.org/" target="_blank">Astrolabe</a>, the Sorbonne university and the Institut d’Alembert. It also helps with delphinidae monitoring along the French Mediterranean coast by the association <a href="https://miraceti.org/" target="_blank">MIRACETI</a>. The annotations made through APLOSE also enabled to evaluate automated detection algorithm performance and to create a geophony reference dataset.
                    APLOSE relies on its open-source community, welcoming contributions from everywhere to enhance and develop the platform further. For example, the platform was deployed on the <a href="https://www.france-energies-marines.org/" target="_blank">France Energies Marines</a> server to be managed and used by their team. They will also take part in the development of the future technological improvements of APLOSE, in collaboration with the OSmOSE team.
                    All the codes and associate documentations to collaborate can be found on our Github page.
                </p>
            </div>

            <div className="section-content">
                <h2>Join the APLOSE community</h2>
                <p>
                    By analyzing these acoustic data, help us providing a better insight into marine life behaviours, habitat conditions, and environmental changes. We invite you to join the APLOSE platform, whether you are a developer, researcher, or simply passionate about marine conservation. You can get involved with us in various ways: annotate data, conduct research, or develop new technological features.
                    If you want to join us, or have any question, please contact us here!
                </p>
            </div>
            <CollaboratorsBanner collaborators={collaborators}></CollaboratorsBanner>
        </div>
    );
};
