import * as React from 'react';

import { Box } from '../Primitives/Box';

interface Props {
  color: string;
}

export const ColorToken = (props: Props) => {
  return <Box style={{ backgroundColor: props.color }} />;
};
