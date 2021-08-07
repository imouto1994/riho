import React, { useState, useEffect } from "react";
import { Link, useParams, useHistory } from "react-router-dom";
import { useQuery } from "react-query";
import classnames from "classnames";
import { useSwipeable } from "react-swipeable";

import { Button } from "./Button";
import { Image } from "./Image";
import { IconCheck } from "./IconCheck";
import { Logo } from "./Logo";
import { IconGrid } from "./IconGrid";
import { IconSettings } from "./IconSettings";
import {
  KEY_BOOK_BY_ID,
  KEY_BOOK_PAGES_BY_ID,
  KEY_BOOKS_IN_TITLE,
} from "../constants/query-key";
import { useLockBodyScroll } from "../hooks/lock-body-scroll";
import { useLocalStorage } from "../hooks/local-storage";
import { useWindowSize } from "../hooks/window-size";
import {
  getBookPageURL,
  getBookById,
  getBookPagesById,
  getBooksInTitle,
} from "../services/book";

import styles from "./PageBook.module.css";

const PAGE_LOAD_BATCH_COUNT = 3;

export function PageBook(props) {
  const { bookIds: bookIdsParam } = useParams();
  const bookIds = bookIdsParam.split("/");
  const bookId = bookIds[0];
  const altBookId = bookIds[1];
  const [showGrid, setShowGrid] = useState(false);
  const [selectedPageIndex, setSelectedPageIndex] = useState(-1);
  const [navHidden, setNavHidden] = useState(true);
  const [pageLimit, setPageLimit] = useState(1);
  const [pageLoadCount, setPageLoadCount] = useState(0);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAlt, setShowAlt] = useState(false);
  const [altPageLimit, setAltPageLimit] = useState(1);
  const [altPageLoadCount, setAltPageLoadCount] = useState(0);
  const [readingMode, setReadingMode] = useLocalStorage(
    "reading_mode",
    "width",
  );
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const windowRatio = windowHeight / windowWidth;

  const {
    status: bookFetchStatus,
    data: book,
    error: bookFetchError,
  } = useQuery([KEY_BOOK_BY_ID, bookId], () => getBookById(bookId));

  const {
    status: altBookFetchStatus,
    data: altBook,
    error: altBookFetchError,
  } = useQuery([KEY_BOOK_BY_ID, altBookId], () => getBookById(altBookId), {
    enabled: altBookId != null,
  });

  const {
    status: bookPagesFetchStatus,
    data: bookPages,
    error: bookPagesFetchError,
  } = useQuery([KEY_BOOK_PAGES_BY_ID, bookId], () => getBookPagesById(bookId));

  const titleId = book?.title_id;

  const {
    status: booksFetchStatus,
    data: books = [],
    error: booksFetchError,
  } = useQuery([KEY_BOOKS_IN_TITLE, titleId], () => getBooksInTitle(titleId), {
    enabled: titleId != null,
  });

  const {
    status: altBookPagesFetchStatus,
    data: altBookPages,
    error: altBookPagesFetchError,
  } = useQuery(
    [KEY_BOOK_PAGES_BY_ID, altBookId],
    () => getBookPagesById(altBookId),
    { enabled: altBookId != null },
  );

  useEffect(() => {
    if (pageLoadCount === pageLimit) {
      setPageLimit((prevLimit) => prevLimit + PAGE_LOAD_BATCH_COUNT);
    }
  }, [pageLoadCount]);

  useEffect(() => {
    if (altPageLoadCount === altPageLimit) {
      setAltPageLimit((prevLimit) => prevLimit + PAGE_LOAD_BATCH_COUNT);
    }
  }, [altPageLoadCount]);

  useEffect(() => {
    if (selectedPageIndex >= 0) {
      document
        .getElementById(`${showAlt ? "alt-" : ""}page-${selectedPageIndex}`)
        .scrollIntoView();
    }
  }, [selectedPageIndex]);

  const handlers = useSwipeable({
    onSwipedRight: (eventData) => {
      setShowAlt((flag) => !flag);
    },
  });

  if (
    bookFetchStatus === "loading" ||
    bookPagesFetchStatus === "loading" ||
    (altBookId != null && altBookFetchStatus === "loading") ||
    (altBookId != null && altBookPagesFetchStatus === "loading")
  ) {
    return null;
  } else if (
    bookFetchStatus === "error" ||
    bookPagesFetchStatus === "error" ||
    (altBookId != null && altBookFetchStatus === "error") ||
    (altBookId != null && altBookPagesFetchStatus === "error")
  ) {
    return null;
  }

  function onPageClick(e, pageIndex, isAlt) {
    if (showGrid) {
      setShowGrid(false);
      setSelectedPageIndex(pageIndex);
    } else {
      const windowWidth = window.innerWidth;
      const clickX = e.clientX;
      if (clickX < windowWidth / 10) {
        const currentPageEl = document.getElementById(`page-${pageIndex}`);
        const currentPageTop = currentPageEl.getBoundingClientRect().top;
        if (currentPageTop < -5) {
          currentPageEl.scrollIntoView();
        } else if (pageIndex > 0) {
          const prevPageEl = document.getElementById(`page-${pageIndex - 1}`);
          prevPageEl.scrollIntoView();
        }
      } else if (clickX < (9 * windowWidth) / 10) {
        setNavHidden(!navHidden);
      } else {
        const currentPageEl = document.getElementById(`page-${pageIndex}`);
        const currentPageTop = currentPageEl.getBoundingClientRect().top;
        if (currentPageTop > 5) {
          currentPageEl.scrollIntoView();
        } else if (pageIndex < bookPages.length - 1) {
          const nextPageEl = document.getElementById(`page-${pageIndex + 1}`);
          nextPageEl.scrollIntoView();
        }
      }
    }
  }

  function onPageLoad() {
    setPageLoadCount((prevCount) => prevCount + 1);
  }

  function onAltPageLoad() {
    setAltPageLoadCount((prevCount) => prevCount + 1);
  }

  function onGridButtonClick() {
    setShowGrid(true);
    window.scrollTo(0, 0);
    setNavHidden(true);
  }

  function onSettingsButtonClick() {
    setShowSettingsModal(true);
  }

  function onSettingsReadingModeChange(newReadingMode) {
    setReadingMode(newReadingMode);
  }

  function renderPage(index) {
    const bookPage = bookPages[index];
    const altBookPage = altBookId != null ? altBookPages[index] : null;
    const bookPageRatio = bookPage.height / bookPage.width;
    const altBookPageRatio =
      altBookId != null ? altBookPage.height / altBookPage.width : null;
    const maxRatio =
      altBookId == null
        ? bookPageRatio
        : Math.max(altBookPageRatio, bookPageRatio);
    const ratio = showAlt ? altBookPageRatio : bookPageRatio;
    const shouldSpanWidth = showGrid || readingMode !== "height";

    const pageClassName = classnames(styles.page, {
      [styles.pagePreview]: showGrid,
      [styles.pageSpanWidth]: shouldSpanWidth,
      [styles.pageSpanHeight]: !shouldSpanWidth,
      [styles.pageWebtoon]: !showGrid && readingMode === "webtoon",
    });
    const imageClassName = classnames(styles.pageImage, {
      [styles.pageImageHidden]: showAlt,
    });
    const altImageClassName = classnames(styles.pageImage, {
      [styles.pageImageHidden]: !showAlt,
    });

    return (
      <div
        className={pageClassName}
        key={index}
        onClick={(e) => onPageClick(e, index)}
        id={`page-${index}`}
      >
        <div
          className={styles.pageWrapper}
          style={
            !shouldSpanWidth
              ? {
                  width: ratio < windowRatio ? "100%" : `${100 / ratio}vh`,
                }
              : undefined
          }
        >
          {shouldSpanWidth ? (
            <div
              className={styles.pagePadding}
              style={{
                paddingTop: `${maxRatio * 100}%`,
              }}
            />
          ) : null}
          <Image
            className={imageClassName}
            src={getBookPageURL(bookId, bookPage.index)}
            onImageLoad={onPageLoad}
            shouldLoad={index < pageLimit}
          />
          {altBookId != null ? (
            <Image
              className={altImageClassName}
              src={getBookPageURL(altBookId, altBookPage.index)}
              onImageLoad={onAltPageLoad}
              shouldLoad={index < altPageLimit}
            />
          ) : null}
          {!navHidden ? (
            <div className={styles.pageInfo}>
              {showAlt
                ? `${altBookPage.width} x ${altBookPage.height}`
                : `${bookPage.width} x ${bookPage.height}`}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  const title = book.name;
  const altTitle = altBookId != null ? altBook.name : "";
  const gridClassName = classnames(styles.pageGrid, {
    [styles.pageGridPreview]: showGrid,
  });

  let prevId = null;
  let nextId = null;
  if (books.length > 2) {
    const bookIndex = books.map((b) => b.id).indexOf(book.id);
    if (bookIndex > 0) {
      prevId = books[bookIndex - 1].id;
    }
    if (bookIndex < books.length - 1) {
      nextId = books[bookIndex + 1].id;
    }
  }

  return (
    <>
      <Header
        title={showAlt ? altTitle : title}
        hidden={navHidden}
        titleId={book.title_id}
        onGridButtonClick={onGridButtonClick}
        onSettingsButtonClick={onSettingsButtonClick}
      />
      <div className={gridClassName} {...(altBookId != null ? handlers : {})}>
        {[...Array(bookPages.length)].map((_, index) => renderPage(index))}
      </div>
      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          readingMode={readingMode}
          onReadingModeChange={onSettingsReadingModeChange}
        />
      )}
      {books.length > 2 ? (
        <Footer prevBookId={prevId} nextBookId={nextId} hidden={navHidden} />
      ) : null}
    </>
  );
}

function Header(props) {
  const { title, hidden, titleId, onGridButtonClick, onSettingsButtonClick } =
    props;
  const headerClassName = classnames(styles.header, {
    [styles.headerHidden]: hidden,
  });

  return (
    <div className={headerClassName}>
      <div className={styles.headerLeftSection}>
        <Link to={`/title/${titleId}`} className={styles.headerBackLink}>
          <Logo className={styles.headerBackIcon} />
        </Link>
        <div>
          <p className={styles.headerTitle}>{title}</p>
        </div>
      </div>
      <div className={styles.headerRightSection}>
        <button className={styles.headerButton} onClick={onSettingsButtonClick}>
          <IconSettings className={styles.headerIcon} />
        </button>
        <button className={styles.headerButton} onClick={onGridButtonClick}>
          <IconGrid className={styles.headerIcon} />
        </button>
      </div>
    </div>
  );
}

function Footer(props) {
  const history = useHistory();
  const { nextBookId, prevBookId, hidden } = props;
  const footerClassName = classnames(styles.footer, {
    [styles.footerHidden]: hidden,
  });

  function onPrevClick() {
    history.push(`/book/${prevBookId}`);
  }

  function onNextClick() {
    history.push(`/book/${nextBookId}`);
  }

  return (
    <div className={footerClassName}>
      <div className={styles.footerLeftSection}>
        {prevBookId != null ? (
          <Button onClick={onPrevClick}>Previous Chapter</Button>
        ) : null}
      </div>
      <div className={styles.footerRightSection}>
        {nextBookId != null ? (
          <Button onClick={onNextClick}>Next Chapter</Button>
        ) : null}
      </div>
    </div>
  );
}

function SettingsModal(props) {
  const { onClose, readingMode, onReadingModeChange } = props;

  useLockBodyScroll();

  function renderReadingModeOption(value, text) {
    const isSelected = value === readingMode;
    const iconClassName = classnames(styles.settingsOptionIcon, {
      [styles.settingsOptionIconHidden]: !isSelected,
    });

    return (
      <div
        className={styles.settingsOption}
        onClick={() => onReadingModeChange(value)}
      >
        <IconCheck className={iconClassName} />
        <p className={styles.settingsOptionTitle}>{text}</p>
      </div>
    );
  }

  function onReset() {
    onReadingModeChange("width");
  }

  return (
    <>
      <div className={styles.settingsModalOverlay} onClick={onClose} />
      <div className={styles.settingsModal}>
        <div className={styles.settingsActions}>
          <Button style="transparent" onClick={onReset}>
            Reset
          </Button>
          <Button onClick={onClose}>Done</Button>
        </div>
        <div className={styles.settingsSection}>
          <p className={styles.settingsSectionTitle}>Reading Mode</p>
          {renderReadingModeOption("width", "Width")}
          {renderReadingModeOption("height", "Height")}
          {renderReadingModeOption("webtoon", "Webtoon")}
        </div>
      </div>
    </>
  );
}
