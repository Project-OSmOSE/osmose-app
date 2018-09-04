import assert from 'assert';
import React from 'react';
import { mount, shallow } from 'enzyme';

import App from '../src/App';
import Navbar from '../src/App';

describe('testing App component', function () {
    this.timeout(20000);
    it('mounts properly with Navbar', () => {
        let wrapper = mount(<App />);
        assert(wrapper.find(Navbar).text().includes('Datasets'), 'Navbar linking to datasets not found');
        wrapper.unmount();
    });
});
