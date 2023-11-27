import React, {useEffect, useState} from "react";
import {PageTitle} from '../../components/PageTitle';
import {CardMember} from '../../components/CardMember';
import imgTitle from '../../img/illust/pexels-daniel-torobekov-5901263_1280_thin.jpg';
import {TeamMember} from "../../models/team";
import {API_FETCH_INIT} from "../../utils";

import './styles.css';

const MEMBERS_URL = '/api/members';

export const People: React.FC = () => {

    const [members, setMembers] = useState<Array<TeamMember>>([])

    const membersOld: Array<TeamMember> = [
        {
            id: '1',
            name: "Dorian Cazau",
            biography: "I'm a french Assistant Professor specialized in Data Sciences for Ocean Sciences, currently working in the Lab-STICC at ENSTA Bretagne in Brest (French Brittany). <br/> My scientific background is in fundamental physics, audio signal processing and general acoustic engineering, with which I have more recently combined statistical modeling and machine learning methods. My research can be summarized as the development of original physics-based machine learning methods to answer concrete questions from different acoustic-using communities, including oceanography, bioacoustics and music.",
            picture: "https://osmose.ifremer.fr/static/media/team_dodo_420_420.38e7fc104498740d44ca.webp",
            position: "Assistant Professor",
            mailAddress: 'test@tests.fr',
            personalWebsiteURL: "https://cazaudorian.wixsite.com/homepage",
        },
        {
            id: '2',
            name: "Dorian Cazau",
            biography: "I'm a french Assistant Professor specialized in Data Sciences for Ocean Sciences, currently working in the Lab-STICC at ENSTA Bretagne in Brest (French Brittany). <br/> My scientific background is in fundamental physics, audio signal processing and general acoustic engineering, with which I have more recently combined statistical modeling and machine learning methods. My research can be summarized as the development of original physics-based machine learning methods to answer concrete questions from different acoustic-using communities, including oceanography, bioacoustics and music.",
            picture: "https://osmose.ifremer.fr/static/media/team_dodo_420_420.38e7fc104498740d44ca.webp",
            position: "Assistant Professor",
            mailAddress: 'test@tests.fr',
            personalWebsiteURL: "https://cazaudorian.wixsite.com/homepage",
        },
        {
            id: '4',
            name: "Dorian Cazau",
            biography: "I'm a french Assistant Professor specialized in Data Sciences for Ocean Sciences, currently working in the Lab-STICC at ENSTA Bretagne in Brest (French Brittany). <br/> My scientific background is in fundamental physics, audio signal processing and general acoustic engineering, with which I have more recently combined statistical modeling and machine learning methods. My research can be summarized as the development of original physics-based machine learning methods to answer concrete questions from different acoustic-using communities, including oceanography, bioacoustics and music.",
            picture: "https://osmose.ifremer.fr/static/media/team_dodo_420_420.38e7fc104498740d44ca.webp",
            position: "Assistant Professor",
            mailAddress: 'test@tests.fr',
            personalWebsiteURL: "https://cazaudorian.wixsite.com/homepage",
        },
        {
            id: '5',
            name: "Dorian Cazau",
            biography: "I'm a french Assistant Professor specialized in Data Sciences for Ocean Sciences, currently working in the Lab-STICC at ENSTA Bretagne in Brest (French Brittany). <br/> My scientific background is in fundamental physics, audio signal processing and general acoustic engineering, with which I have more recently combined statistical modeling and machine learning methods. My research can be summarized as the development of original physics-based machine learning methods to answer concrete questions from different acoustic-using communities, including oceanography, bioacoustics and music.",
            picture: "https://osmose.ifremer.fr/static/media/team_dodo_420_420.38e7fc104498740d44ca.webp",
            position: "Assistant Professor",
            mailAddress: 'test@tests.fr',
            personalWebsiteURL: "https://cazaudorian.wixsite.com/homepage",
        },
        {
            id: '6',
            name: "Dorian Cazau",
            biography: "I'm a french Assistant Professor specialized in Data Sciences for Ocean Sciences, currently working in the Lab-STICC at ENSTA Bretagne in Brest (French Brittany). <br/> My scientific background is in fundamental physics, audio signal processing and general acoustic engineering, with which I have more recently combined statistical modeling and machine learning methods. My research can be summarized as the development of original physics-based machine learning methods to answer concrete questions from different acoustic-using communities, including oceanography, bioacoustics and music.",
            picture: "https://osmose.ifremer.fr/static/media/team_dodo_420_420.38e7fc104498740d44ca.webp",
            position: "Assistant Professor",
            mailAddress: 'test@tests.fr',
            personalWebsiteURL: "https://cazaudorian.wixsite.com/homepage",
        },
        {
            id: '7',
            name: "Dorian Cazau",
            biography: "I'm a french Assistant Professor specialized in Data Sciences for Ocean Sciences, currently working in the Lab-STICC at ENSTA Bretagne in Brest (French Brittany). <br/> My scientific background is in fundamental physics, audio signal processing and general acoustic engineering, with which I have more recently combined statistical modeling and machine learning methods. My research can be summarized as the development of original physics-based machine learning methods to answer concrete questions from different acoustic-using communities, including oceanography, bioacoustics and music.",
            picture: "https://osmose.ifremer.fr/static/media/team_dodo_420_420.38e7fc104498740d44ca.webp",
            position: "Assistant Professor",
            mailAddress: 'test@tests.fr',
            personalWebsiteURL: "https://cazaudorian.wixsite.com/homepage",
        },
        {
            id: '8',
            name: "Dorian Cazau",
            biography: "I'm a french Assistant Professor specialized in Data Sciences for Ocean Sciences, currently working in the Lab-STICC at ENSTA Bretagne in Brest (French Brittany). <br/> My scientific background is in fundamental physics, audio signal processing and general acoustic engineering, with which I have more recently combined statistical modeling and machine learning methods. My research can be summarized as the development of original physics-based machine learning methods to answer concrete questions from different acoustic-using communities, including oceanography, bioacoustics and music.",
            picture: "https://osmose.ifremer.fr/static/media/team_dodo_420_420.38e7fc104498740d44ca.webp",
            position: "Assistant Professor",
            mailAddress: 'test@tests.fr',
            personalWebsiteURL: "https://cazaudorian.wixsite.com/homepage",
        },
        {
            id: '3',
            name: "Dorian Cazau",
            biography: "I'm a french Assistant Professor specialized in Data Sciences for Ocean Sciences, currently working in the Lab-STICC at ENSTA Bretagne in Brest (French Brittany). <br/> My scientific background is in fundamental physics, audio signal processing and general acoustic engineering, with which I have more recently combined statistical modeling and machine learning methods. My research can be summarized as the development of original physics-based machine learning methods to answer concrete questions from different acoustic-using communities, including oceanography, bioacoustics and music.",
            picture: "https://osmose.ifremer.fr/static/media/team_dodo_420_420.38e7fc104498740d44ca.webp",
            position: "Assistant Professor",
            mailAddress: 'test@tests.fr',
            personalWebsiteURL: "https://cazaudorian.wixsite.com/homepage",
            isFormerMember: true
        }
    ]

    useEffect(() => {
       const fetchMembers = async () => {
           try {
               const response = await fetch(MEMBERS_URL, API_FETCH_INIT);
               if (!response.ok) {
                   console.error(`Cannot fetch members, got error: [${response.status}] ${response.statusText}`);
                   return;
               }
               setMembers(await response.json());
           } catch (error) {
               console.error(`Cannot fetch members, got error: ${error}`);
           }
       }
       fetchMembers();
    }, []);

    return (
        <div id="people-page">

            <PageTitle img={imgTitle} imgAlt="People Banner">
                <h1 className="align-self-center">
                    PEOPLE
                </h1>
            </PageTitle>

            <section>
                <div className="members-grid">
                    {
                        members.filter(member => !member.isFormerMember)
                            .map(member => (<CardMember key={member.id} member={member}></CardMember>))
                    }
                </div>
                <h2>Former members</h2>
                <div className="members-grid">
                    {
                        members.filter(member => member.isFormerMember)
                            .map(member => (<CardMember key={member.id} member={member}></CardMember>))
                    }
                </div>
            </section>

        </div>
    );
}
