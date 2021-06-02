import React from "react";
import classnames from "classnames";

import { Logo } from "./Logo";

import styles from "./Loading.module.css";

export function Loading(props) {
  const { className } = props;
  const logoClassName = classnames(styles.loading, className);

  return <Logo className={logoClassName} />;
}
