import assert from 'assert';
import React from 'react';
import { mount, shallow } from 'enzyme';

import App from '../src/App';
import Navbar from '../src/App';

describe('testing App component', function () {
    this.timeout(20000);

    it('mounts properly with Navbar when token is in state', () => {
        let wrapper = mount(<App />);
        wrapper.setState({app_token: 'testToken'});
        wrapper.update();
        assert(wrapper.find(Navbar).text().includes('Datasets'), 'Navbar linking to datasets not found');
        wrapper.unmount();
    });

    it('mounts properly with Navbar when token is in cookie', () => {
        document.cookie = 'token=testing';
        let wrapper = mount(<App />);
        wrapper.update();
        assert(wrapper.find(Navbar).text().includes('Datasets'), 'Navbar linking to datasets not found');
        wrapper.unmount();
        document.cookie = 'token=;max-age=0';
    });

    it('mounts properly with Login when token is not there', () => {
        let wrapper = mount(<App />);
        assert(wrapper.text().includes('Login'), 'Login not found');
        wrapper.unmount();
    });
});
