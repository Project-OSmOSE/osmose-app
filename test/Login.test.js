import assert from 'assert';
import React from 'react';
import nock from 'nock';
import { mount, shallow } from 'enzyme';

import Login from '../src/Login';

describe('testing Login component', function () {
    this.timeout(20000);

    it('mounts properly with title', () => {
        let wrapper = mount(<Login />);
        assert(wrapper.text().includes('Login'), 'Title "Login" not found');
        wrapper.unmount();
    });

    it('correctly use handleToken prop for 200 response', () => {
        nock(process.env.REACT_APP_API_URL).post('/authentication/authenticate').reply(200, {token: 'TestToken'});
        let token = '';
        let handleToken = (t) => { token = t };
        let wrapper = shallow(<Login handleToken={handleToken} />);
        return wrapper.instance().handleSubmit({preventDefault: () => null}).then(() => {
            assert.deepEqual(token, 'TestToken', "The token hasn't been set to the correct value");
            wrapper.unmount();
        });
    });

    it('correctly sets error message for 401 response', () => {
        nock(process.env.REACT_APP_API_URL).post('/authentication/authenticate').reply(401);
        let wrapper = shallow(<Login />);
        return wrapper.instance().handleSubmit({preventDefault: () => null}).then(() => {
            assert.deepEqual(wrapper.state('error').message, 'Access denied', "Error message isn't correct");
            wrapper.unmount();
        });
    });

    it('sends default error message for 400 response', () => {
        nock(process.env.REACT_APP_API_URL).post('/authentication/authenticate').reply(400);
        let wrapper = shallow(<Login />);
        return wrapper.instance().handleSubmit({preventDefault: () => null}).then(() => {
            assert.deepEqual(wrapper.state('error').message, 'Bad Request', "Error message isn't correct");
            wrapper.unmount();
        });
    });

    it('correctly shows error messages', () => {
        let wrapper = shallow(<Login />);
        wrapper.setState( {error: { message: 'Testing Error Message' } });
        let errorMSG = wrapper.find('p.error-message').first();
        assert.deepEqual(errorMSG.text(), 'Testing Error Message', "Doesn't show correct error message");
        wrapper.unmount();
    });

    it('works when re-submitting after an error', () => {
        nock(process.env.REACT_APP_API_URL).post('/authentication/authenticate').reply(401);
        nock(process.env.REACT_APP_API_URL).post('/authentication/authenticate').reply(200);
        let handleToken = () => { return 'it works' };
        let wrapper = shallow(<Login handleToken={handleToken} />);
        return wrapper.instance().handleSubmit({preventDefault: () => null}).then(() => {
            assert.notDeepEqual(wrapper.state('error'), null, "There should be an error");
            return wrapper.instance().handleSubmit({preventDefault: () => null})
        }).then(res => {
            assert.deepEqual(res, 'it works', "We should get the result of handleToken");
            wrapper.unmount();
        });
    });
});
