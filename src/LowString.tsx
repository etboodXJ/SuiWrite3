import React from 'react';

interface Props {
  text: string;
}

const LowString: React.FC<Props> = ({ text }) => {
  const truncatedText = `${text.slice(0, 4)}...${text.slice(-4)}`;

  return <span>{truncatedText}</span>;
};

export default LowString;