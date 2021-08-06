import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useHistory } from "react-router-dom";
import { useQuery } from "react-query";
import classnames from "classnames";
import { useSwipeable } from "react-swipeable";
import { useInView } from "react-intersection-observer";

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

function delay(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

export function PageBook(props) {
  const { bookIds: bookIdsParam } = useParams();
  const bookIds = bookIdsParam.split("/");
  const bookId = bookIds[0];
  const altBookId = bookIds[1];
  const [showGrid, setShowGrid] = useState(false);
  const [selectedPageIndex, setSelectedPageIndex] = useState(-1);
  const [navHidden, setNavHidden] = useState(true);
  const [pageLimit, setPageLimit] = useState(0);
  const [pageURLs, setPageURLs] = useState([]);
  const pageLoadCount = useRef(0);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAlt, setShowAlt] = useState(false);
  // const [altPageLimit, setAltPageLimit] = useState(0);
  const [altPageURLs, setAltPageURLs] = useState([]);
  // const [altPageLoadCount, setAltPageLoadCount] = useState(0);
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
  } = useQuery([KEY_BOOK_PAGES_BY_ID, altBookId], () =>
    getBookPagesById(altBookId),
  );

  useEffect(() => {
    if (bookPages != null && altBookPages != null) {
      setPageLimit(1);
      setPageURLs([...Array(bookPages.length)].map(() => null));
      setAltPageURLs([...Array(bookPages.length)].map(() => null));
    }
  }, [bookPages, altBookPages]);
  console.log("LIMIT", pageLimit);
  useEffect(() => {
    async function fetchPage(index) {
      const bookPage = bookPages[index];
      const bookPageURL = getBookPageURL(bookId, bookPage.index);
      let blob;
      for (let i = 0; i < 5; i++) {
        try {
          const response = await fetch(bookPageURL);
          if (response.status === 200) {
            blob = await response.blob();
            console.log("GOT BLOB", index);
            break;
          } else {
            await delay(1000);
          }
        } catch (err) {
          console.log("ERR", err);
          await delay(1000);
        }
      }
      const blobURL = URL.createObjectURL(blob);
      setPageURLs((urls) =>
        urls.map((url, i) => (i === index ? blobURL : url)),
      );
    }

    async function fetchAltPage(index) {
      const altBookPage = altBookPages[index];
      const altBookPageURL = getBookPageURL(altBookId, altBookPage.index);
      let blob;
      for (let i = 0; i < 5; i++) {
        try {
          const response = await fetch(altBookPageURL);
          if (response.status === 200) {
            blob = await response.blob();
            console.log("GOT ALT BLOB", index);
            break;
          } else {
            await delay(1000);
          }
        } catch (err) {
          console.log("ERR", err);
          await delay(1000);
        }
      }
      const blobURL = URL.createObjectURL(blob);
      setAltPageURLs((urls) =>
        urls.map((url, i) => (i === index ? blobURL : url)),
      );
    }

    async function fetchImages() {
      const promises = [];
      console.log("NEW PROMISES", pageLoadCount.current, pageLimit);
      for (let i = pageLoadCount.current; i < pageLimit; i++) {
        promises.push(fetchPage(i));
        if (altBookId != null) {
          promises.push(fetchAltPage(i));
        }
      }
      try {
        await Promise.all(promises);
      } catch (err) {
        console.log("ERR 2", err);
      }
      console.log("LETS GO", pageLoadCount.current, pageLimit);

      if (pageLoadCount.current !== pageLimit) {
        pageLoadCount.current = pageLimit;
        console.log("FAK", pageLimit, bookPages.length);
        if (pageLimit < bookPages.length) {
          console.log("WTF");
          setPageLimit(
            Math.min(pageLimit + PAGE_LOAD_BATCH_COUNT, bookPages.length),
          );
        }
      }
    }
    fetchImages();
  }, [pageLimit]);

  // useEffect(() => {
  //   if (altBookPages != null) {
  //     setAltPageLimit(1);
  //     setAltPageURLs([...Array(altBookPages.length)].map(() => null));
  //   }
  // }, [altBookPages]);

  // useEffect(async () => {
  //   async function fetchAltPage(index) {
  //     const altBookPage = altBookPages[index];
  //     const altBookPageURL = getBookPageURL(altBookId, altBookPage.index);
  //     const response = await fetch(altBookPageURL);
  //     const blob = await response.blob();
  //     const blobURL = URL.createObjectURL(blob);
  //     setAltPageURLs((urls) =>
  //       urls.map((url, i) => (i === index ? blobURL : url)),
  //     );
  //   }

  //   for (let i = altPageLoadCount; i < altPageLimit; i++) {
  //     await fetchAltPage(i);
  //   }

  //   if (altPageLoadCount !== altPageLimit) {
  //     setAltPageLoadCount(altPageLimit);
  //     if (altPageLimit < altBookPages.length) {
  //       setAltPageLimit(
  //         Math.min(altPageLimit + PAGE_LOAD_BATCH_COUNT, altBookPages.length),
  //       );
  //     }
  //   }
  // }, [altPageLimit]);

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

  function onPageClick(e, pageIndex) {
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
        {bookPages.map((bookPage, index) => {
          const altBookPage = altBookId != null ? altBookPages[index] : null;
          const pageURL = pageURLs[index];
          const altPageURL = altBookId != null ? altPageURLs[index] : null;

          return (
            <Page
              key={index}
              bookPage={bookPage}
              altBookPage={altBookPage}
              pageURL={pageURL}
              altPageURL={altPageURL}
              readingMode={readingMode}
              showGrid={showGrid}
              showAlt={showAlt}
              index={index}
              windowHeight={windowHeight}
              windowWidth={windowWidth}
              onPageClick={onPageClick}
            />
          );
        })}
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

function Page(props) {
  const {
    bookPage,
    altBookPage,
    pageURL,
    altPageURL,
    readingMode,
    showGrid,
    showAlt,
    index,
    onPageClick,
    windowHeight,
    windowWidth,
  } = props;
  const { ref, inView } = useInView({
    rootMargin: `${windowHeight * 3}px 0px`,
  });

  const maxRatio =
    altBookPage == null
      ? bookPage.height / bookPage.width
      : altBookPage.height / altBookPage.width >
        bookPage.height / bookPage.width
      ? altBookPage.height / altBookPage.width
      : bookPage.height / bookPage.width;
  const ratio = showAlt
    ? altBookPage.height / altBookPage.width
    : bookPage.height / bookPage.width;
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
      onClick={(e) => onPageClick(e, index)}
      id={`page-${index}`}
      ref={ref}
    >
      <div
        className={styles.pageWrapper}
        style={
          !shouldSpanWidth
            ? {
                width:
                  ratio < windowHeight / windowWidth
                    ? "100%"
                    : `${100 / ratio}vh`,
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
        {pageURL != null && inView ? (
          <Image className={imageClassName} src={pageURL} />
        ) : null}
        {altPageURL != null && inView ? (
          <Image className={altImageClassName} src={altPageURL} />
        ) : null}
      </div>
    </div>
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
