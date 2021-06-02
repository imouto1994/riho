import React from "react";
import classnames from "classnames";

import styles from "./Button.module.css";

export function Button(props) {
  const { className, children, style = "primary", onClick } = props;
  const buttonClassName = classnames(styles.button, className, {
    [styles.buttonTransparent]: style === "transparent",
  });

  return (
    <button className={buttonClassName} onClick={onClick}>
      {children}
    </button>
  );
}
