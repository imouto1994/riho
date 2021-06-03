import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import classnames from "classnames";

import { Image } from "./Image";
import { IconBack } from "./IconBack";
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
  const {
    params: { bookId },
  } = props;
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

  if (bookFetchStatus === "loading" || bookPagesFetchStatus === "loading") {
    return null;
  } else if (bookFetchStatus === "error" || bookPagesFetchStatus === "error") {
    return null;
  }

  function onNavToggle() {
    setNavHidden(!navHidden);
  }

  function onPageLoad() {
    setPageLoadCount((prevCount) => prevCount + 1);
  }

  const { title, author } = parseName(book.name);

  return (
    <div>
      <Header
        title={title}
        author={author}
        hidden={navHidden}
        seriesId={book.seriesId}
      />
      {[...Array(book.media.pagesCount)].map((_, index) => (
        <div className={styles.page} key={index} onClick={onNavToggle}>
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
  );
}

function Header(props) {
  const { title, author, hidden, seriesId } = props;
  const headerClassName = classnames(styles.header, {
    [styles.headerHidden]: hidden,
  });

  return (
    <div className={headerClassName}>
      <Link to={`/series/${seriesId}`}>
        <IconBack className={styles.headerBackIcon} />
      </Link>
      <div>
        <p className={styles.headerTitle}>{title}</p>
        <p className={styles.headerAuthor}>{author}</p>
      </div>
    </div>
  );
}
