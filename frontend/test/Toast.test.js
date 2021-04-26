import assert from 'assert';
import React from 'react';
import { mount } from 'enzyme';

import Toast from '../src/Toast';

describe('testing Toast Component', function() {
  it('mounts properly with correct message', () => {
    const toastMsg = { msg: 'Don\'t Panic!', lvl: 'warning' };
    let wrapper = mount(<Toast toastMsg={toastMsg} />);
    assert(wrapper.text().includes(toastMsg.msg), 'Message passed by props not found');
    wrapper.unmount();
  });

  it('properly hide message on click', () => {
    const toastMsg = { msg: 'Don\'t Panic!', lvl: 'warning' };
    let wrapper = mount(<Toast toastMsg={toastMsg} />);
    wrapper.find('button').simulate('click');
    assert(wrapper.instance().state.status, 'toasty-hiding');
    wrapper.unmount();
  });
});
