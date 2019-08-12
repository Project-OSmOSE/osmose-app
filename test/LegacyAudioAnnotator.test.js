import assert from 'assert';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { mount, shallow } from 'enzyme';

import LegacyAudioAnnotator from '../src/LegacyAudioAnnotator';

describe('minimal testing of AudioAnnotator component', function () {
    this.timeout(20000);

    it('mounts properly with all scripts', () => {
        let props = {
            app_token: 'test',
            match: {
                params: {
                    annotation_task_id: 1
                }
            }
        };
        let wrapper = mount(
            <MemoryRouter>
                <LegacyAudioAnnotator {...props}/>
            </MemoryRouter>
        );
        assert.deepEqual(document.querySelectorAll('script').length, 14);
        wrapper.unmount();
    });
});
