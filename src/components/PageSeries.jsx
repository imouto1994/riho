import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "react-query";

import { IconBack } from "./IconBack";
import { Image } from "./Image";
import {
  KEY_SERIES_BY_ID,
  KEY_BOOKS_IN_SERIES,
  KEY_BOOK_PAGES_BY_ID,
} from "../constants/query-key";
import { getSeriesById, getSeriesThumbnailUrl } from "../services/series";
import {
  getBooksInSeries,
  getBookPageUrl,
  getBookPagesById,
} from "../services/book";
import { parseName } from "../utils/string";

import styles from "./PageSeries.module.css";

export function PageSeries(props) {
  const {
    params: { seriesId },
  } = props;

  // Fetch the series data
  const {
    status: seriesFetchStatus,
    data: series,
    error: seriesFetchError,
  } = useQuery([KEY_SERIES_BY_ID, seriesId], () => getSeriesById(seriesId));

  // Fetch the list of books in the series
  const {
    status: booksFetchStatus,
    data: booksQueryResult,
    error: booksFetchError,
  } = useQuery([KEY_BOOKS_IN_SERIES, seriesId], () =>
    getBooksInSeries(seriesId),
  );

  // Fetch the dimension of each book page if there's only 1 book in the series
  const books = booksQueryResult?.content || [];
  const {
    status: singleBookPagesFetchStatus,
    data: singleBookPages,
    error: singleBookPagesFetchError,
  } = useQuery(
    [KEY_BOOK_PAGES_BY_ID, books[0]],
    () => getBookPagesById(books[0]?.id),
    {
      enabled: books.length === 1,
    },
  );

  if (
    seriesFetchStatus === "loading" ||
    booksFetchStatus === "loading" ||
    (books.length === 1 && singleBookPagesFetchStatus === "loading")
  ) {
    return null;
  } else if (
    seriesFetchStatus === "error" ||
    booksFetchStatus === "error" ||
    (books.length === 1 && singleBookPagesFetchStatus === "error")
  ) {
    return null;
  }

  const { name, booksCount } = series;
  const { title, author, circle } = parseName(name);

  return (
    <>
      <Header />
      <div className={styles.heroBackgroundWrapper}>
        <Image
          className={styles.heroBackground}
          src={getSeriesThumbnailUrl(seriesId)}
        />
        <div className={styles.heroBackgroundOverlay} />
      </div>
      <div className={styles.infoContainer}>
        <div className={styles.infoThumbnailWrapper}>
          <Image
            className={styles.infoThumbnail}
            src={getSeriesThumbnailUrl(seriesId)}
          />
        </div>
        <div className={styles.infoContent}>
          <p className={styles.infoTitle}>{title}</p>
          <p className={styles.infoAuthor}>{author}</p>
          <p className={styles.infoCircle}>{circle}</p>
        </div>
      </div>
      {books.length === 1 ? (
        <ThumbnailsPreview book={books[0]} bookPages={singleBookPages} />
      ) : null}
      {books.length > 1 ? <ChaptersList chapters={books} /> : null}
    </>
  );
}

function ThumbnailsPreview(props) {
  const { book, bookPages } = props;

  return (
    <div className={styles.previewGrid}>
      {[...Array(Math.min(8, book.media.pagesCount))].map((_, index) => (
        <div className={styles.preview} key={index}>
          <Link className={styles.previewWrapper} to={`/book/${book.id}`}>
            <div
              className={styles.previewPadding}
              style={{
                paddingTop: `${
                  (bookPages[index].height * 100) / bookPages[index].width
                }%`,
              }}
            />
            <Image
              className={styles.previewImage}
              src={getBookPageUrl(book.id, index + 1)}
            />
          </Link>
        </div>
      ))}
    </div>
  );
}

function ChaptersList(props) {
  const { chapters } = props;

  return (
    <div className={styles.chapters}>
      {chapters.map((chapter) => (
        <Link
          className={styles.chapter}
          key={chapter.id}
          to={`/book/${chapter.id}`}
        >
          <div className={styles.chapterTitle}>{chapter.name}</div>
          <div className={styles.chapterSubtitle}>
            {`${chapter.media.pagesCount} pages`}
          </div>
        </Link>
      ))}
    </div>
  );
}

function Header() {
  return (
    <div className={styles.header}>
      <Link to="/">
        <IconBack className={styles.headerBackIcon} />
      </Link>
    </div>
  );
}
