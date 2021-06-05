import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "react-query";
import classnames from "classnames";

import { Image } from "./Image";
import { IconBack } from "./IconBack";
import { IconGrid } from "./IconGrid";
import { KEY_BOOK_BY_ID, KEY_BOOK_PAGES_BY_ID } from "../constants/query-key";
import {
  getBookPageUrl,
  getBookById,
  getBookPagesById,
} from "../services/book";
import { parseName } from "../utils/string";

import styles from "./PageBook.module.css";

const PAGE_LOAD_BATCH_COUNT = 5;

export function PageBook(props) {
  const { bookId } = useParams();
  const [showGrid, setShowGrid] = useState(false);
  const [selectedPageIndex, setSelectedPageIndex] = useState(-1);
  const [navHidden, setNavHidden] = useState(true);
  const [pageLimit, setPageLimit] = useState(PAGE_LOAD_BATCH_COUNT);
  const [pageLoadCount, setPageLoadCount] = useState(0);

  const {
    status: bookFetchStatus,
    data: book,
    error: bookFetchError,
  } = useQuery([KEY_BOOK_BY_ID, bookId], () => getBookById(bookId));

  const {
    status: bookPagesFetchStatus,
    data: bookPages,
    error: bookPagesFetchError,
  } = useQuery([KEY_BOOK_PAGES_BY_ID, bookId], () => getBookPagesById(bookId));

  useEffect(() => {
    if (pageLoadCount === pageLimit) {
      setPageLimit((prevLimit) => prevLimit + PAGE_LOAD_BATCH_COUNT);
    }
  }, [pageLoadCount]);

  useEffect(() => {
    if (selectedPageIndex >= 0) {
      document.getElementById(`page-${selectedPageIndex}`).scrollIntoView();
    }
  }, [selectedPageIndex]);

  if (bookFetchStatus === "loading" || bookPagesFetchStatus === "loading") {
    return null;
  } else if (bookFetchStatus === "error" || bookPagesFetchStatus === "error") {
    return null;
  }

  function onPageClick(pageIndex) {
    if (showGrid) {
      setShowGrid(false);
      setSelectedPageIndex(pageIndex);
    } else {
      setNavHidden(!navHidden);
    }
  }

  function onPageLoad() {
    setPageLoadCount((prevCount) => prevCount + 1);
  }

  function onGridButtonClick() {
    setShowGrid(true);
    window.scrollTo(0, 0);
    setNavHidden(true);
  }

  const { title, author } = parseName(book.name);
  const gridClassName = classnames(styles.pageGrid, {
    [styles.pageGridPreview]: showGrid,
  });
  const pageClassName = classnames(styles.page, {
    [styles.pagePreview]: showGrid,
  });

  return (
    <div>
      <Header
        title={title}
        author={author}
        hidden={navHidden}
        seriesId={book.seriesId}
        onGridButtonClick={onGridButtonClick}
      />
      <div className={gridClassName}>
        {[...Array(book.media.pagesCount)].map((_, index) => (
          <div
            className={pageClassName}
            key={index}
            onClick={() => onPageClick(index)}
            id={`page-${index}`}
          >
            <div className={styles.pageWrapper}>
              <div
                className={styles.pagePadding}
                style={{
                  paddingTop: `${
                    (bookPages[index].height * 100) / bookPages[index].width
                  }%`,
                }}
              />
              <Image
                className={styles.pageImage}
                src={getBookPageUrl(bookId, index + 1)}
                onImageLoad={onPageLoad}
                shouldLoad={index < pageLimit}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Header(props) {
  const { title, author, hidden, seriesId, onGridButtonClick } = props;
  const headerClassName = classnames(styles.header, {
    [styles.headerHidden]: hidden,
  });

  return (
    <div className={headerClassName}>
      <div className={styles.headerLeftSection}>
        <Link to={`/series/${seriesId}`}>
          <IconBack className={styles.headerBackIcon} />
        </Link>
        <div>
          <p className={styles.headerTitle}>{title}</p>
          <p className={styles.headerAuthor}>{author}</p>
        </div>
      </div>
      <div className={styles.headerRightSection}>
        <button className={styles.headerGridButton} onClick={onGridButtonClick}>
          <IconGrid className={styles.headerGridIcon} />
        </button>
      </div>
    </div>
  );
}
