import React, { useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "react-query";

import { Logo } from "./Logo";
import { Image } from "./Image";
import { KEY_TITLE_BY_ID, KEY_BOOKS_IN_TITLE } from "../constants/query-key";
import { getTitleById, getTitleCoverURL } from "../services/title";
import { getBooksInTitle } from "../services/book";
import { parseTitleName } from "../utils/string";

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

  if (titleFetchStatus === "loading" || booksFetchStatus === "loading") {
    return null;
  } else if (titleFetchStatus === "error" || booksFetchStatus === "error") {
    return null;
  }

  const { name } = title;
  const { title: titleName, author, circle } = parseTitleName(name);

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
      {books.length > 0 ? <ChaptersList chapters={books} /> : null}
    </>
  );
}

function ChaptersList(props) {
  const { chapters } = props;

  if (chapters.length === 2) {
    const enChapter = chapters[0];
    const jpChapter = chapters[1];
    return (
      <div className={styles.chapters}>
        <Link
          className={styles.chapter}
          key={enChapter.id}
          to={`/book/${enChapter.id}/${jpChapter.id}`}
        >
          <div className={styles.chapterTitle}>{enChapter.name}</div>
          <div className={styles.chapterSubtitle}>
            {`${enChapter.page_count} pages`}
          </div>
        </Link>
        <Link
          className={styles.chapter}
          key={jpChapter.id}
          to={`/book/${jpChapter.id}/${enChapter.id}`}
        >
          <div className={styles.chapterTitle}>{jpChapter.name}</div>
          <div className={styles.chapterSubtitle}>
            {`${jpChapter.page_count} pages`}
          </div>
        </Link>
      </div>
    );
  }

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
      <Link to="/" className={styles.headerBackLink}>
        <Logo className={styles.headerBackIcon} />
      </Link>
    </div>
  );
}
