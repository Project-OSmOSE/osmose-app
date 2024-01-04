import assert from 'assert';
import React from 'react';
import { mount } from 'enzyme';

import ListChooser from '../src/components/ListChooser.js';

describe('testing ListChooser component', function () {
    this.timeout(20000);

    it('mounts properly with correct selections', () => {
        let choices_list = new Map([
            [2, { id: 2, name: 'B' }],
            [3, { id: 3, name: 'C' }],
            [4, { id: 4, name: 'D' }]
        ]);
        let chosen_list = new Map([
            [1, { id: 1, name: 'A' }],
            [5, { id: 5, name: 'E' }]
        ]);
        let onSelectChange = () => null;
        let onDelClick = () => null;
        let wrapper = mount(
            <ListChooser
                choice_type='obj'
                choices_list={choices_list}
                chosen_list={chosen_list}
                onSelectChange={onSelectChange}
                onDelClick={onDelClick}
            />
        );
        let chosen_elements = wrapper.find('div.border.rounded').map(div => { return div.text(); });
        assert.deepEqual(chosen_elements, [ 'A x', 'E x' ]);
        let options = wrapper.find('option').map(option => { return option.text(); });
        assert.deepEqual(options, [ 'Select a obj', 'B', 'C', 'D' ]);
        wrapper.unmount();
    });
});
