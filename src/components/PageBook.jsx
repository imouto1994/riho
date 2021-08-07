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

const PAGE_LOAD_BATCH_COUNT = 5;

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
  const windowRatio = windowWidth / windowHeight;

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
        const currentPageEl = document.getElementById(
          `${isAlt ? "alt-" : ""}page-${pageIndex}`,
        );
        const currentPageTop = currentPageEl.getBoundingClientRect().top;
        if (currentPageTop < -5) {
          currentPageEl.scrollIntoView();
        } else if (pageIndex > 0) {
          const prevPageEl = document.getElementById(
            `${isAlt ? "alt-" : ""}page-${pageIndex - 1}`,
          );
          prevPageEl.scrollIntoView();
        }
      } else if (clickX < (9 * windowWidth) / 10) {
        setNavHidden(!navHidden);
      } else {
        const currentPageEl = document.getElementById(
          `${isAlt ? "alt-" : ""}page-${pageIndex}`,
        );
        const currentPageTop = currentPageEl.getBoundingClientRect().top;
        if (currentPageTop > 5) {
          currentPageEl.scrollIntoView();
        } else if (pageIndex < bookPages.length - 1) {
          const nextPageEl = document.getElementById(
            `${isAlt ? "alt-" : ""}page-${pageIndex + 1}`,
          );
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

  function renderPage(index, isAlt) {
    const bookPage = isAlt ? altBookPages[index] : bookPages[index];
    const bookPageRatio = bookPage.width / bookPage.height;
    const shouldSpanWidth = showGrid || readingMode !== "height";

    const pageClassName = classnames(styles.page, {
      [styles.pageHidden]: isAlt !== showAlt,
      [styles.pagePreview]: showGrid,
      [styles.pageSpanWidth]: shouldSpanWidth,
      [styles.pageSpanHeight]: !shouldSpanWidth,
      [styles.pageWebtoon]: !showGrid && readingMode === "webtoon",
    });

    return (
      <div
        className={pageClassName}
        key={index}
        onClick={(e) => onPageClick(e, index, isAlt)}
        id={`${isAlt ? "alt-" : ""}page-${index}`}
      >
        <div
          className={styles.pageWrapper}
          style={
            !shouldSpanWidth
              ? {
                  width:
                    bookPageRatio > windowRatio
                      ? "100%"
                      : `${(bookPage.width * 100) / bookPage.height}vh`,
                }
              : undefined
          }
        >
          <div
            className={styles.pagePadding}
            style={{
              paddingTop: `${(bookPage.height * 100) / bookPage.width}%`,
            }}
          />
          <Image
            className={styles.pageImage}
            src={getBookPageURL(isAlt ? altBookId : bookId, bookPage.index)}
            onImageLoad={isAlt ? onAltPageLoad : onPageLoad}
            shouldLoad={index < pageLimit}
          />
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
        {[...Array(bookPages.length)].map((_, index) =>
          renderPage(index, false),
        )}
        {altBookId != null
          ? [...Array(altBookPages.length)].map((_, index) =>
              renderPage(index, true),
            )
          : null}
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
