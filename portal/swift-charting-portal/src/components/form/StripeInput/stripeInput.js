import React, { useState, useImperativeHandle, forwardRef } from "react";
import { alpha, useTheme } from "@mui/material/styles";

const StripeInput = forwardRef(function StripeInput(props, ref) {
  const { component: Component, options, ...other } = props;
  const theme = useTheme();
  const [mountNode, setMountNode] = useState(null);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => mountNode && mountNode.focus(),
    }),
    [mountNode]
  );

  return (
    <Component
      onReady={setMountNode}
      options={{
        ...options,
      }}
      {...other}
    />
  );
});

export default StripeInput;
