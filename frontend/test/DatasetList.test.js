import assert from 'assert';
import React from 'react';
import nock from 'nock';
import { mount, shallow } from 'enzyme';

import DatasetList from '../src/DatasetList';
import datasets from './fixtures/dataset_list.json';

describe('testing DatasetList component', function () {
    this.timeout(20000);

    it('mounts properly with title', () => {
        let wrapper = mount(<DatasetList />);
        assert(wrapper.text().includes('Datasets'), 'Title "Datasets" not found');
        wrapper.unmount();
    });

    it('shows the correct datasets', () => {
        nock(process.env.REACT_APP_API_URL).get('/dataset/list').reply(200, datasets);
        let wrapper = shallow(<DatasetList />, { disableLifecycleMethods: true });
        return wrapper.instance().componentDidMount().then(() => {
            wrapper.update();
            let lines = wrapper.find('tr');
            assert.deepEqual(lines.length, 4, 'There should be 4 lines, 1 for the header and 1 for each of the 3 datasets');
            lines.slice(1).map((line, index) => {
                assert(line.text().includes(datasets[index].name), 'Line number ' + index + ' should have name ' + datasets[index].name);
            });
            wrapper.unmount();
        });
    });

    it('shows the error message when there is a problem', () => {
        let wrapper = shallow(<DatasetList />);
        return wrapper.instance().componentDidMount().then(() => {
            wrapper.update();
            assert(wrapper.text().includes('Nock: No match for request'), 'Expected error message not found');
            wrapper.unmount();
        });
    });
});
