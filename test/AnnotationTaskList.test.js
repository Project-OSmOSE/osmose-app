import assert from 'assert';
import React from 'react';
import nock from 'nock';
import { mount, shallow } from 'enzyme';

import AnnotationTaskList from '../src/AnnotationTaskList';
import details from './fixtures/annotation_campaign_detail.json';
import annotation_tasks from './fixtures/annotation_task_list.json';

describe('testing AnnotationTaskList component', function () {
    this.timeout(20000);

    it('mounts properly with title', () => {
        let wrapper = mount(<AnnotationTaskList match={{ params: { campaign_id: 1 } }} />);
        assert(wrapper.text().includes('Annotation Tasks'), 'Title "Annotation Tasks" not found');
        wrapper.unmount();
    });

    it('shows the correct annotation_tasks', () => {
        nock(process.env.REACT_APP_API_URL).get('/annotation-campaign/5').reply(200, details);
        nock(process.env.REACT_APP_API_URL).get('/annotation-task/campaign/5/my-list').reply(200, annotation_tasks);
        let wrapper = shallow(<AnnotationTaskList match={{ params: { campaign_id: 5 } }} />, { disableLifecycleMethods: true });
        return wrapper.instance().componentDidMount().then(() => {
            wrapper.update();
            let lines = wrapper.find('tr');
            assert.deepEqual(lines.length, 6, 'There should be 6 lines, 1 for the header and 1 for each of the 5 annotation_tasks');
            lines.slice(1).map((line, index) => {
                assert(line.text().includes(annotation_tasks[index].filename), 'Line number ' + index + ' should have filename ' + annotation_tasks[index].filename);
            });
            wrapper.unmount();
        });
    });

    it('shows the error message when there is a problem', () => {
        let wrapper = shallow(<AnnotationTaskList match={{ params: { campaign_id: 1 } }} />, { disableLifecycleMethods: true });
        return wrapper.instance().componentDidMount().then(() => {
            wrapper.update();
            assert(wrapper.text().includes('Nock: No match for request'), 'Expected error message not found');
            wrapper.unmount();
        });
    });
});
