import React, { useRef, useState, useEffect } from "react";
import classnames from "classnames";

import styles from "./Image.module.css";

export function Image(props) {
  const { className, src, shouldLoad = true, onImageLoad } = props;
  const imageRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  function onLoad() {
    if (!isLoaded) {
      setIsLoaded(true);
      if (onImageLoad != null) {
        onImageLoad();
      }
    }
  }

  function onError() {
    if (!isLoaded) {
      if (onImageLoad != null) {
        onImageLoad();
      }
    }
  }

  useEffect(() => {
    if (imageRef.current != null) {
      if (imageRef.current.complete) {
        onLoad();
      } else if (isLoaded) {
        setIsLoaded(false);
      }
    }
  }, [src]);

  const imageClassName = classnames(className, {
    [styles.imageHidden]: !isLoaded,
  });

  if (!shouldLoad) {
    return null;
  }

  return (
    <img
      src={src}
      className={imageClassName}
      onLoad={onLoad}
      onError={onError}
      ref={imageRef}
    />
  );
}
