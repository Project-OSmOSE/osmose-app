import React, { type ReactNode } from 'react';
import { ExternalLink, Link } from '@/components/base/Button';

import { NavigationMenu } from '@/components/base/NavigationMenu';
import styles from './Navigation.module.scss';
import logo from '/images/logo/x96.png';
import { useLoaderData, useParams, useSearch } from '@tanstack/react-router';
import { Spinner } from '@/components/base';

export const Annotator: React.FC<{ className?: string, children: ReactNode, loading?: boolean }> = ({ className, children, loading }) => {
    const { campaign } = useLoaderData({ from: '/_authenticated/annotation-campaign/$campaignID' })
    const { phaseType } = useParams({ from: '/_authenticated/annotation-campaign/$campaignID/phase/$phaseType' })
    const search = useSearch({ strict: false });

    return <NavigationMenu.Root className={ [ styles.Navigation, styles.Annotator, className ].join(' ') }>
        <NavigationMenu.List>
            <NavigationMenu.Item>
                <Link to="/annotation-campaign" className={ styles.Title }>
                    <img src={ logo } alt="APLOSE"/>
                    <h1>APLOSE</h1>
                </Link>
            </NavigationMenu.Item>
        </NavigationMenu.List>

        { children }

        <NavigationMenu.List horizontal>
            { loading && <Spinner/> }

            { campaign.instructionsUrl && <NavigationMenu.Item>
                <ExternalLink target="_blank"
                              color="medium"
                              href={ campaign.instructionsUrl }>
                    Campaign instructions
                </ExternalLink>
            </NavigationMenu.Item> }

            <NavigationMenu.Item>
                <Link to="/annotation-campaign/$campaignID/phase/$phaseType"
                      params={ { campaignID: campaign.id, phaseType } }
                      search={ search }
                      replace>
                    Back to campaign
                </Link>
            </NavigationMenu.Item>
        </NavigationMenu.List>
    </NavigationMenu.Root>
}
