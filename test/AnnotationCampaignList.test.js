import assert from 'assert';
import React from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import nock from 'nock';
import { mount, shallow } from 'enzyme';

import AnnotationCampaignList from '../src/AnnotationCampaignList';
import annotation_campaigns from './fixtures/annotation_campaign_list.json';

describe('testing AnnotationCampaignList component', function () {
    this.timeout(20000);

    it('mounts properly with title', () => {
        let wrapper = mount(<Router><AnnotationCampaignList /></Router>);
        assert(wrapper.text().includes('Annotation Campaigns'), 'Title "Annotation Campaigns" not found');
        wrapper.unmount();
    });

    it('shows the correct annotation campaigns', () => {
        nock(process.env.REACT_APP_API_URL).get('/annotation-campaign/list').reply(200, annotation_campaigns);
        let wrapper = shallow(<AnnotationCampaignList />, { disableLifecycleMethods: true });
        return wrapper.instance().componentDidMount().then(() => {
            wrapper.update();
            let lines = wrapper.find('tr');
            assert.deepEqual(lines.length, 3, 'There should be 3 lines, 1 for the header and 1 for each of the 2 annotation campaigns');
            lines.slice(1).map((line, index) => {
                let first_link_text = line.find('Link').first().props().children;
                assert.deepEqual(first_link_text, annotation_campaigns[index].name);
            });
            wrapper.unmount();
        });
    });

    it('shows the error message when there is a problem', () => {
        let wrapper = shallow(<AnnotationCampaignList />);
        return wrapper.instance().componentDidMount().then(() => {
            wrapper.update();
            assert(wrapper.text().includes('Nock: No match for request'), 'Expected error message not found');
            wrapper.unmount();
        });
    });
});
