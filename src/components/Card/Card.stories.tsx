import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Card, CardProps } from '.';

import logo from '../../images/logo_people.png';

export default {
  title: 'Base/Card',
  component: Card
} as Meta;

const Template: Story<CardProps> = (args) => <Card {...args}>
  <p>This is text</p>
  <p>No, this is Patrick</p>
</Card>;

export const Empty = Template.bind({});
Empty.args = {}

export const Title = Template.bind({});
Title.args = {
  title: 'Card with a title',
};

export const ImgLeft = Template.bind({});
ImgLeft.args = {
  title: 'Card with a left image',
  img: logo,
  imgSide: 'left',
};

export const ImgRight = Template.bind({});
ImgRight.args = {
  title: 'Card with a right image',
  img: logo,
  imgSide: 'right',
};
