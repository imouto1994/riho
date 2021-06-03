import React, { useState, useEffect } from "react";
import classnames from "classnames";
import { Link } from "react-router-dom";

import { IconArrowLeft } from "./IconArrowLeft";

import styles from "./Pagination.module.css";

const SIBLING_COUNT = 2;
const BOUNDARY_COUNT = 1;

export function Pagination(props) {
  const { count, page, getPageUrl } = props;

  const startPages = range(1, Math.min(BOUNDARY_COUNT, count));
  const endPages = range(
    Math.max(count - BOUNDARY_COUNT + 1, BOUNDARY_COUNT + 1),
    count,
  );

  const siblingsStart = Math.max(
    Math.min(
      // Natural start
      page - SIBLING_COUNT,
      // Lower boundary when page is high
      count - BOUNDARY_COUNT - SIBLING_COUNT * 2 - 1,
    ),
    // Greater than startPages
    BOUNDARY_COUNT + 2,
  );

  const siblingsEnd = Math.min(
    Math.max(
      // Natural end
      page + SIBLING_COUNT,
      // Upper boundary when page is low
      BOUNDARY_COUNT + SIBLING_COUNT * 2 + 2,
    ),
    // Less than endPages
    endPages[0] - 2,
  );

  // Basic list of items to render
  // e.g. items = ['previous', 1, 'ellipsis', 4, 5, 6, 'ellipsis', 10, 'next']
  const items = [
    "previous",
    ...startPages,
    // Start ellipsis
    ...(siblingsStart > BOUNDARY_COUNT + 2
      ? ["start-ellipsis"]
      : BOUNDARY_COUNT + 1 < count - BOUNDARY_COUNT
      ? [BOUNDARY_COUNT + 1]
      : []),
    // Sibling pages
    ...range(siblingsStart, siblingsEnd),
    // End ellipsis
    ...(siblingsEnd < count - BOUNDARY_COUNT - 1
      ? ["end-ellipsis"]
      : count - BOUNDARY_COUNT > BOUNDARY_COUNT
      ? [count - BOUNDARY_COUNT]
      : []),
    ...endPages,
    "next",
  ];

  function renderItem(item, index) {
    if (typeof item === "number") {
      const wrapperClassName = classnames(styles.pageEntryWrapper, {
        [styles.pageEntryWrapperSelected]: page === item,
      });
      return (
        <li key={index}>
          <Link className={wrapperClassName} to={getPageUrl(item)}>
            {item}
          </Link>
        </li>
      );
    } else if (item.indexOf("ellipsis") !== -1) {
      return (
        <li key={index}>
          <div
            className={`${styles.pageEntryWrapper} ${styles.pageEntryWrapperEllipsis}`}
          >
            ...
          </div>
        </li>
      );
    } else if (item === "previous") {
      const isDisabled = page <= 1;
      const wrapperClassName = classnames(styles.pageEntryWrapper, {
        [styles.pageEntryWrapperDisabled]: isDisabled,
      });
      const iconClassName = classnames(styles.pageEntryIcon, {
        [styles.pageEntryIconDisabled]: isDisabled,
      });

      return (
        <li key={index}>
          <Link to={getPageUrl(page - 1)} className={wrapperClassName}>
            <IconArrowLeft className={iconClassName} />
          </Link>
        </li>
      );
    } else {
      const isDisabled = page >= count;
      const wrapperClassName = classnames(styles.pageEntryWrapper, {
        [styles.pageEntryWrapperDisabled]: isDisabled,
      });
      const iconClassName = classnames(
        styles.pageEntryIcon,
        styles.pageEntryIconInverse,
        {
          [styles.pageEntryIconDisabled]: isDisabled,
        },
      );

      return (
        <li key={index}>
          <Link to={getPageUrl(page + 1)} className={wrapperClassName}>
            <IconArrowLeft className={iconClassName} />
          </Link>
        </li>
      );
    }
  }

  return <ul className={styles.pageEntries}>{items.map(renderItem)}</ul>;
}

function range(start, end) {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
}
