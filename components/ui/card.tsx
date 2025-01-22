import React from 'react';
import classNames from 'classnames';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={classNames('bg-white shadow-lg rounded-lg overflow-hidden', className)}
      {...props} 
    >
      {children}
    </div>
  );
};

export default Card;
