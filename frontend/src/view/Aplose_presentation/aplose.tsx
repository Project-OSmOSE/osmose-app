import React, {useEffect, useState} from "react";
import './aplosestyles.css';
import { PageTitle } from "../../components/PageTitle";
import imgTitle from "../../img/illust/Content_head.jpg";
import etape1 from "../../img/illust/etape1.png";
import etape2 from "../../img/illust/etape2.png";
import etape3 from "../../img/illust/etape3.png";
import etape4 from "../../img/illust/etape4.png";
import etape5 from "../../img/illust/etape5.png";
import etape6 from "../../img/illust/etape6.png";
import etape7 from "../../img/illust/etape7.png";
import imgGlider from "../../img/illust/GIF.gif";
import video from "../../img/illust/démo_APLOSE.mp4";
import { CollaboratorsBanner } from "../../components/CollaboratorsBanner/CollaboratorsBanner";
import {Collaborator} from "../../interface/collaborator";
import {useFetchArray} from "../../services/api/utils";

export const Aplose: React.FC = () => {

    const trainingImages = [etape1, etape2, etape3, etape4, etape5,etape6,etape7];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [zoomedImageIndex, setZoomedImageIndex] = useState<number | null>(null);
    const [collaborators, setCollaborators] = useState<Array<Collaborator> | undefined>();
    const fetchCollaborators = useFetchArray<Array<Collaborator>>('/api/collaborators/on_presentation/');
    const nextSlide = () =>{
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
    }, [])

    return (
        <div id="aplose-page">
            <PageTitle img={imgTitle} imgAlt="Aplose Page Banner">APLOSE</PageTitle>


            <div className="section-content">
                <h2 className="title">Welcome to the overview page for APLOSE: Annotation Platform for Ocean Sound Explorers</h2>
                <p>
                    APLOSE: the cutting-edge platform for marine acoustic research. APLOSE stands for Annotation Platform for Ocean Sound Explorers,
                    an open-source tool empowering collaboration in the underwater realm.
                    Dive into our brief overview video to see APLOSE's impact on marine science.
                </p>
                <div className="video-section">
                    <video controls style={{ width: "100%" }}>
                        <source src={video} type="video/mp4" />
                    </video>
                </div>
            </div>

            <div className="section-content">
                <h2>Key Features and Benefits</h2>
                <p>
                    Explore the key features and benefits of APLOSE, our state-of-the-art platform for collaborative annotation and marine sound analysis. APLOSE is designed to boost marine research by providing a collaborative workspace where both experts and enthusiasts can together annotate and unravel the mysteries of the ocean depths.
                    With its open-source infrastructure, APLOSE stands as a beacon of innovation, fostering unprecedented knowledge sharing and scientific advancement in the study of marine ecosystems.
                </p>
                <img src={imgGlider} alt="Glider" style={{ width: '100%', marginTop: '20px' }} />
            </div>

            <div className="section-content">
                <h2>Platform Features</h2>
                <p>
                    Explore the core functionalities of APLOSE through detailed screenshots that illustrate how our platform operates.
                    Each feature is designed to enhance the capabilities of diverse users including researchers, educators, and citizen scientists.
                    From comprehensive data analysis tools to user-friendly interfaces for collaborative projects, APLOSE empowers all users to contribute effectively to the field of marine acoustics.
                    Discover how each feature not only supports advanced research but also enriches educational experiences and engages the broader community in scientific discovery.
                </p>

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
                <h2>Importance of Underwater Data</h2>
                <p>
                    Underwater recordings are crucial for a wide range of research and conservation efforts.
                    These sounds offer a window into the hidden world beneath the waves, providing invaluable insights into marine life behaviors,
                    habitat conditions, and environmental changes. By analyzing these acoustic data, scientists can track species populations, understand migratory patterns,
                    and monitor the impacts of human activities on marine ecosystems. This information is vital for developing effective conservation strategies and protecting our oceans for future generations.
                </p>
            </div>

            <div className="section-content">
                <h2>Join the APLOSE Community</h2>
                <p>
                    We invite you to join the APLOSE platform, where you can engage in various forms of participation: annotating data, conducting research, or furthering education.
                    Whether you're a seasoned scientist, an aspiring researcher, or a passionate educator, APLOSE offers a collaborative environment to contribute to the understanding of marine acoustics.
                    By participating, you help advance our collective knowledge and make a meaningful impact on marine conservation and research. Come be a part of our community and explore the depths of the ocean with us.
                </p>
            </div>

            <div className="section-content">
                <h2>Resources and Training</h2>
                <p>
                    To ensure all new users can effectively utilize the APLOSE platform, we offer a range of tutorials and training documents.
                    These resources are designed to help you quickly become proficient in navigating the interface and using the tools available for marine acoustic analysis.
                    Whether you're starting your first annotation project or looking to deepen your research capabilities, our comprehensive guides will support your journey.
                </p>
                <div className="section-content">

                    <a href="https://github.com/Project-OSmOSE/osmose-app/wiki/Annotator-User-Guide ">Annotator user guide</a>/
                    <a href="/campagne.pdf" target="_blank" rel="noopener noreferrer">Campagne d’Annotation APOCADO</a>
                </div>
            </div>

            <div className="section-content">
                <h2>Collaboration and Open Source</h2>
                <p>
                    APLOSE thrives on its open-source community, welcoming contributions from around the globe to enhance and develop the platform further. We encourage you to join our collaborative efforts,
                    whether you are a developer, researcher, or simply passionate about marine conservation. Our project is built on the principle of shared knowledge and collective improvement. You can access our code repository,
                    contribution guidelines, and view acknowledgments of our contributors through provided links. Together, let's continue to innovate and expand the capabilities of APLOSE for the benefit of marine research and conservation.
                </p>
                <div className="section-content">
                    <a href="https://github.com/Project-OSmOSE/osmose-app"> GitHub</a>
                </div>
            </div>
            <CollaboratorsBanner collaborators={collaborators}></CollaboratorsBanner>

        </div>
    );
};
