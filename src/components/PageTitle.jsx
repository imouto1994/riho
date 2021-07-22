import React, { useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "react-query";

import { IconBack } from "./IconBack";
import { Image } from "./Image";
import {
  KEY_TITLE_BY_ID,
  KEY_BOOKS_IN_TITLE,
  KEY_BOOK_PAGES_BY_ID,
} from "../constants/query-key";
import { getTitleById, getTitleCoverURL } from "../services/title";
import {
  getBooksInTitle,
  getBookPageURL,
  getBookPagesById,
} from "../services/book";
import { parseName } from "../utils/string";

import styles from "./PageTitle.module.css";

export function PageTitle() {
  const { titleId } = useParams();

  // Fetch the title data
  const {
    status: titleFetchStatus,
    data: title,
    error: titleFetchError,
  } = useQuery([KEY_TITLE_BY_ID, titleId], () => getTitleById(titleId));

  // Fetch the list of books in the title
  const {
    status: booksFetchStatus,
    data: books = [],
    error: booksFetchError,
  } = useQuery([KEY_BOOKS_IN_TITLE, titleId], () => getBooksInTitle(titleId));

  // Fetch the dimension of each book page if there's only 1 book in the title
  const {
    status: singleBookPagesFetchStatus,
    data: singleBookPages,
    error: singleBookPagesFetchError,
  } = useQuery(
    [KEY_BOOK_PAGES_BY_ID, books[0]],
    () => getBookPagesById(books[0].id),
    {
      enabled: books.length === 1,
    },
  );

  if (
    titleFetchStatus === "loading" ||
    booksFetchStatus === "loading" ||
    (books.length === 1 && singleBookPagesFetchStatus === "loading")
  ) {
    return null;
  } else if (
    titleFetchStatus === "error" ||
    booksFetchStatus === "error" ||
    (books.length === 1 && singleBookPagesFetchStatus === "error")
  ) {
    return null;
  }

  const { name } = title;
  const { title: titleName, author, circle } = parseName(name);

  return (
    <>
      <Header />
      <div className={styles.heroBackgroundWrapper}>
        <Image
          className={styles.heroBackground}
          src={getTitleCoverURL(titleId)}
        />
        <div className={styles.heroBackgroundOverlay} />
      </div>
      <div className={styles.infoContainer}>
        <div className={styles.infoThumbnailWrapper}>
          <div
            className={styles.infoThumbnailPadding}
            style={{
              paddingTop: `${(title.cover_height * 100) / title.cover_width}%`,
            }}
          ></div>
          <Image
            className={styles.infoThumbnail}
            src={getTitleCoverURL(titleId)}
          />
        </div>
        <div className={styles.infoContent}>
          <p className={styles.infoTitle}>{titleName}</p>
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
      {[...Array(Math.min(8, book.page_count))].map((_, index) => (
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
              src={getBookPageURL(book.id, bookPages[index].index)}
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
            {`${chapter.page_count} pages`}
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
