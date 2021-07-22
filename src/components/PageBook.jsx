import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "react-query";
import classnames from "classnames";

import { Button } from "./Button";
import { Image } from "./Image";
import { IconCheck } from "./IconCheck";
import { IconBack } from "./IconBack";
import { IconGrid } from "./IconGrid";
import { IconSettings } from "./IconSettings";
import { KEY_BOOK_BY_ID, KEY_BOOK_PAGES_BY_ID } from "../constants/query-key";
import { useLockBodyScroll } from "../hooks/lock-body-scroll";
import { useLocalStorage } from "../hooks/local-storage";
import {
  getBookPageURL,
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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [readingMode, setReadingMode] = useLocalStorage(
    "reading_mode",
    "manga",
  );

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

  function onSettingsButtonClick() {
    setShowSettingsModal(true);
  }

  function onSettingsReadingModeChange(newReadingMode) {
    setReadingMode(newReadingMode);
  }

  const { title, author } = parseName(book.name);
  const gridClassName = classnames(styles.pageGrid, {
    [styles.pageGridPreview]: showGrid,
  });
  const pageClassName = classnames(styles.page, {
    [styles.pagePreview]: showGrid,
    [styles.pageWebtoon]: !showGrid && readingMode === "webtoon",
  });

  return (
    <>
      <Header
        title={title}
        author={author}
        hidden={navHidden}
        titleId={book.title_id}
        onGridButtonClick={onGridButtonClick}
        onSettingsButtonClick={onSettingsButtonClick}
      />
      <div className={gridClassName}>
        {[...Array(book.page_count)].map((_, index) => (
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
                src={getBookPageURL(bookId, bookPages[index].index)}
                onImageLoad={onPageLoad}
                shouldLoad={index < pageLimit}
              />
            </div>
          </div>
        ))}
      </div>
      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          readingMode={readingMode}
          onReadingModeChange={onSettingsReadingModeChange}
        />
      )}
    </>
  );
}

function Header(props) {
  const {
    title,
    author,
    hidden,
    titleId,
    onGridButtonClick,
    onSettingsButtonClick,
  } = props;
  const headerClassName = classnames(styles.header, {
    [styles.headerHidden]: hidden,
  });

  return (
    <div className={headerClassName}>
      <div className={styles.headerLeftSection}>
        <Link to={`/title/${titleId}`}>
          <IconBack className={styles.headerBackIcon} />
        </Link>
        <div>
          <p className={styles.headerTitle}>{title}</p>
          <p className={styles.headerAuthor}>{author}</p>
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
    onReadingModeChange("manga");
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
          {renderReadingModeOption("manga", "Manga")}
          {renderReadingModeOption("webtoon", "Webtoon")}
        </div>
      </div>
    </>
  );
}
