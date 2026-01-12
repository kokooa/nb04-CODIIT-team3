"use client";

import dynamic from "next/dynamic";
import React, { forwardRef } from "react";
import type ReactQuillType from "react-quill-new";

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");

    const Component = forwardRef<ReactQuillType, React.ComponentProps<typeof RQ>>((props, ref) => (
      <RQ
        ref={ref}
        {...props}
      />
    ));

    Component.displayName = "ReactQuill";

    return Component;
  },
  { ssr: false }
);

export default ReactQuill;
