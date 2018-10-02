import assert from 'assert';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import nock from 'nock';
import { mount, shallow } from 'enzyme';

import { DownloadButton } from '../src/AnnotationCampaignDetail';
import AnnotationCampaignDetail from '../src/AnnotationCampaignDetail';

import users from './fixtures/user_list.json';
import details from './fixtures/annotation_campaign_detail.json';

describe('testing DownloadButton component', function () {
    this.timeout(20000);

    it('mounts properly with correct info', () => {
        let wrapper = mount(<DownloadButton url='' value='testing' />);
        assert.deepEqual(wrapper.text(), 'testing');
        wrapper.unmount();
    });

    // We cannot test download capabilites with current implementation as jdom doesn't provide URL.createObjectURL
});

describe('testing AnnotationCampaignDetail component', function () {
    this.timeout(20000);

    it('mounts properly with waiting title', () => {
        let wrapper = mount(<AnnotationCampaignDetail match={{ params: { campaign_id: 1 } }} />);
        assert.deepEqual(wrapper.text(), 'Loading Annotation Campaign ...');
        wrapper.unmount();
    });

    it('contains the info from the API calls and DownloadButton', () => {
        nock(process.env.REACT_APP_API_URL).get('/annotation-campaign/1').reply(200, details);
        nock(process.env.REACT_APP_API_URL).get('/user/list').reply(200, users);
        let wrapper = shallow(<AnnotationCampaignDetail match={{ params: { campaign_id: 1 } }} />, { disableLifecycleMethods: true });
        return wrapper.instance().componentDidMount().then(() => {
            wrapper.update()
            // Check some campaign info
            assert.deepEqual(wrapper.find('h1').text(), 'SPM whale annotation');
            assert(wrapper.text().includes(details.campaign.desc), 'Description not found');
            // Check tasks info
            let table_lines = wrapper.find('table').find('tr');
            assert.deepEqual(table_lines.length, 3, 'Should have 3 table lines (header + 2 lines)');
            assert.deepEqual(table_lines.at(1).text(), 'ek@test.ode3/8');
            // Checking download button
            assert.deepEqual(wrapper.find(DownloadButton).length, 1, 'Should have one DownloadButton');
            wrapper.unmount();
        });
    });

    it('shows the error message when there is a problem', () => {
        let wrapper = shallow(<AnnotationCampaignDetail match={{ params: { campaign_id: 1 } }} />);
        return wrapper.instance().componentDidMount().then(() => {
            wrapper.update();
            assert(wrapper.text().includes('Nock: No match for request'), 'Expected error message not found');
            wrapper.unmount();
        });
    });
});
