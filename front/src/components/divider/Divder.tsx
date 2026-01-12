import React from "react";

interface DividerProps {
  className?: string;
  id?: string;
}

const Divder = ({ className, id }: DividerProps) => {
  return (
    <div
      id={id}
      className={`bg-gray04 h-0.25 ${className}`}
    />
  );
};

export default Divder;
