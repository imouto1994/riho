import React, { useState } from "react";
import { Link, useParams, useHistory } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import classnames from "classnames";
import { useSwipeable } from "react-swipeable";
import { useInView } from "react-intersection-observer";

import { Button } from "./Button";
import { Image } from "./Image";
import { IconCheck } from "./IconCheck";
import { Logo } from "./Logo";
import { IconAdd } from "./IconAdd";
import { IconGrid } from "./IconGrid";
import { IconSettings } from "./IconSettings";
import { IconStar } from "./IconStar";
import { IconStarFilled } from "./IconStarFilled";
import {
  KEY_BOOK_BY_ID,
  KEY_BOOK_PAGES_BY_ID,
  KEY_BOOK_PREVIEWS_BY_ID,
  KEY_BOOKS_IN_TITLE,
} from "../constants/query-key";
import { useLockBodyScroll } from "../hooks/lock-body-scroll";
import { useLocalStorage } from "../hooks/local-storage";
import { useWindowSize } from "../hooks/window-size";
import {
  getBookPageURL,
  getBookPreviewURL,
  getBookById,
  getBookPagesById,
  getBookPreviewsById,
  getBooksInTitle,
  updateBookPageFavorite,
} from "../services/book";
import { createSubtitle } from "../services/title";

import styles from "./PageBook.module.css";

const PAGE_LOAD_BATCH_COUNT = 3;

export function PageBook(props) {
  const { bookIds: bookIdsParam } = useParams();
  const bookIds = bookIdsParam.split("/");
  const bookId = bookIds[0];
  const altBookId = bookIds[1];
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [selectedPageLoaded, setSelectedPageLoaded] = useState(false);
  const [selectedAltPageLoaded, setSelectedAltPageLoaded] = useState(false);
  const [navHidden, setNavHidden] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAlt, setShowAlt] = useState(false);
  const [readingMode, setReadingMode] = useLocalStorage(
    "reading_mode",
    "width",
  );
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  const queryClient = useQueryClient();

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

  const {
    status: bookPreviewsFetchStatus,
    data: bookPreviews,
    error: bookPreviewsFetchError,
  } = useQuery([KEY_BOOK_PREVIEWS_BY_ID, bookId], () =>
    getBookPreviewsById(bookId),
  );

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

  const {
    status: altBookPreviewsFetchStatus,
    data: altBookPreviews,
    error: altBookPreviewsFetchError,
  } = useQuery(
    [KEY_BOOK_PREVIEWS_BY_ID, altBookId],
    () => getBookPreviewsById(altBookId),
    { enabled: altBookId != null },
  );

  const favoriteMutation = useMutation(
    ({ favorite, pageNumber }) =>
      updateBookPageFavorite(bookId, pageNumber, favorite),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([KEY_BOOK_PAGES_BY_ID, bookId]);
      },
    },
  );

  const handlers = useSwipeable({
    onSwipedRight: (eventData) => {
      setShowAlt((flag) => !flag);
    },
  });

  if (
    bookFetchStatus === "loading" ||
    bookPagesFetchStatus === "loading" ||
    bookPreviewsFetchStatus === "loading" ||
    (altBookId != null && altBookFetchStatus === "loading") ||
    (altBookId != null && altBookPagesFetchStatus === "loading") ||
    (altBookId != null && altBookPreviewsFetchStatus === "loading")
  ) {
    return null;
  } else if (
    bookFetchStatus === "error" ||
    bookPagesFetchStatus === "error" ||
    bookPreviewsFetchStatus === "error" ||
    (altBookId != null && altBookFetchStatus === "error") ||
    (altBookId != null && altBookPagesFetchStatus === "error") ||
    (altBookId != null && altBookPreviewsFetchStatus === "error")
  ) {
    return null;
  }

  function onPageClick(e, pageIndex, isAlt) {
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

  function onPageFavoriteUpdate(index, favorite) {
    favoriteMutation.mutate({ favorite, pageNumber: index });
  }

  function onPageLoad(index) {
    if (index === selectedPageIndex) {
      setSelectedPageLoaded(true);
    }
  }

  function onAltPageLoad(index) {
    if (index === selectedPageIndex) {
      setSelectedAltPageLoaded(true);
    }
  }

  function onPreviewClick(e, index) {
    setShowPreviewModal(false);
    const imageElement = document.getElementById(`page-image-${index}`);
    if (imageElement == null || !imageElement.complete) {
      setSelectedPageLoaded(false);
    }
    const altImageElement = document.getElementById(`alt-page-image-${index}`);
    if (altImageElement == null || !altImageElement.complete) {
      setSelectedAltPageLoaded(false);
    }
    setSelectedPageIndex(index);
    const selectedPageElement = document.getElementById(`page-${index}`);
    if (selectedPageElement != null) {
      selectedPageElement.scrollIntoView();
    }
  }

  function onGridButtonClick() {
    setShowPreviewModal(true);
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
        showAlt={showAlt}
        previewURL={book.preview_url}
        altPreviewURL={altBookId != null ? altBook.preview_url : null}
        onGridButtonClick={onGridButtonClick}
        onSettingsButtonClick={onSettingsButtonClick}
      />
      <div {...(altBookId != null ? handlers : {})}>
        {[...Array(bookPages.length)].map((_, index) => (
          <Page
            index={index}
            bookId={bookId}
            altBookId={altBookId}
            bookPage={bookPages[index]}
            altBookPage={altBookId != null ? altBookPages[index] : null}
            onPageClick={onPageClick}
            readingMode={readingMode}
            showAlt={showAlt}
            windowWidth={windowWidth}
            windowHeight={windowHeight}
            onPageLoad={onPageLoad}
            onAltPageLoad={onAltPageLoad}
            selectedPageLoaded={selectedPageLoaded}
            selectedAltPageLoaded={selectedAltPageLoaded}
            selectedPageIndex={selectedPageIndex}
            navHidden={navHidden}
            key={index}
          />
        ))}
      </div>
      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          readingMode={readingMode}
          onReadingModeChange={onSettingsReadingModeChange}
        />
      )}
      {showPreviewModal && (
        <PreviewModal
          onClose={() => setShowPreviewModal(false)}
          bookId={bookId}
          altBookId={altBookId}
          bookPreviews={bookPreviews}
          bookPages={bookPages}
          altBookPreviews={altBookId != null ? altBookPreviews : []}
          altBookPages={altBookId != null ? altBookPages : []}
          showAlt={showAlt}
          windowHeight={windowHeight}
          onPreviewClick={onPreviewClick}
          onPageFavoriteUpdate={onPageFavoriteUpdate}
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
    altBookId,
    altBookPage,
    bookId,
    bookPage,
    index,
    onPageClick,
    readingMode,
    showAlt,
    windowWidth,
    windowHeight,
    onPageLoad,
    onAltPageLoad,
    navHidden,
    selectedPageIndex,
    selectedPageLoaded,
    selectedAltPageLoaded,
  } = props;

  const { ref, inView } = useInView({
    rootMargin: `${windowHeight * 2.5}px 0px ${windowHeight * 3.5}px`,
  });

  const windowRatio = windowHeight / windowWidth;
  const bookPageRatio = bookPage.height / bookPage.width;
  const altBookPageRatio =
    altBookId != null ? altBookPage.height / altBookPage.width : null;
  const maxRatio =
    altBookId == null
      ? bookPageRatio
      : Math.max(altBookPageRatio, bookPageRatio);
  const ratio = showAlt ? altBookPageRatio : bookPageRatio;
  const shouldSpanWidth = readingMode !== "height";

  const pageClassName = classnames(styles.page, {
    [styles.pageSpanWidth]: shouldSpanWidth,
    [styles.pageSpanHeight]: !shouldSpanWidth,
    [styles.pageWebtoon]: readingMode === "webtoon",
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
      ref={ref}
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
        {inView ? (
          <Image
            id={`page-image-${index}`}
            className={imageClassName}
            src={getBookPageURL(bookId, bookPage.index)}
            onImageLoad={() => onPageLoad(index)}
            shouldLoad={index === selectedPageIndex || selectedPageLoaded}
          />
        ) : null}
        {altBookId != null && inView ? (
          <Image
            id={`alt-page-image-${index}`}
            className={altImageClassName}
            src={getBookPageURL(altBookId, altBookPage.index)}
            onImageLoad={() => onAltPageLoad(index)}
            shouldLoad={index === selectedPageIndex || selectedAltPageLoaded}
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

function Header(props) {
  const {
    title,
    hidden,
    titleId,
    onGridButtonClick,
    onSettingsButtonClick,
    showAlt,
    previewURL,
    altPreviewURL,
  } = props;
  const headerClassName = classnames(styles.header, {
    [styles.headerHidden]: hidden,
  });
  const showGridButton = !showAlt ? previewURL != null : altPreviewURL != null;

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
        {showGridButton ? (
          <button className={styles.headerButton} onClick={onGridButtonClick}>
            <IconGrid className={styles.headerIcon} />
          </button>
        ) : null}
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

function PreviewModal(props) {
  const {
    onClose,
    showAlt,
    bookId,
    altBookId,
    bookPreviews,
    bookPages,
    altBookPreviews,
    altBookPages,
    windowHeight,
    onPreviewClick,
    onPageFavoriteUpdate,
  } = props;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [startImageNumber, setStartImageNumber] = useState(undefined);
  const [endImageNumber, setEndImageNumber] = useState(undefined);

  useLockBodyScroll();

  function onCreate() {
    setShowCreateModal(true);
  }

  function onCreateModalClose() {
    setStartImageNumber(undefined);
    setEndImageNumber(undefined);
    setShowCreateModal(false);
  }

  function onPreviewSelect(e, index) {
    if (showCreateModal) {
      if (index === startImageNumber) {
        setStartImageNumber(undefined);
        setEndImageNumber(undefined);
      } else if (index === endImageNumber) {
        setEndImageNumber(undefined);
      } else {
        if (startImageNumber == null) {
          setStartImageNumber(index);
        } else if (index < startImageNumber) {
          setStartImageNumber(index);
        } else {
          setEndImageNumber(index);
        }
      }
    } else {
      onPreviewClick(e, index);
    }
  }

  return (
    <>
      <div className={styles.previewModal}>
        <div className={styles.previewGridHeader}>
          <h1>Previews</h1>
          <div
            className={styles.previewGridHeaderAddIconWrapper}
            onClick={onCreate}
          >
            <IconAdd className={styles.previewGridHeaderAddIcon} />
          </div>
        </div>
        <div className={styles.previewGrid}>
          {[...Array(bookPreviews.length)].map((_, index) => (
            <Preview
              selected={
                showCreateModal &&
                startImageNumber != null &&
                (index === startImageNumber ||
                  (endImageNumber != null &&
                    startImageNumber <= index &&
                    index <= endImageNumber))
              }
              index={index}
              id={showAlt ? altBookId : bookId}
              preview={showAlt ? altBookPreviews[index] : bookPreviews[index]}
              page={showAlt ? altBookPages[index] : bookPages[index]}
              onPreviewClick={onPreviewSelect}
              onPageFavoriteUpdate={onPageFavoriteUpdate}
              windowHeight={windowHeight}
              key={index}
            />
          ))}
        </div>
      </div>
      {showCreateModal ? (
        <CreateModal
          bookId={bookId}
          startImageNumber={startImageNumber}
          endImageNumber={endImageNumber}
          onClose={onCreateModalClose}
        />
      ) : null}
    </>
  );
}

function Preview(props) {
  const {
    id,
    preview,
    selected,
    page,
    index,
    onPreviewClick,
    windowHeight,
    onPageFavoriteUpdate,
  } = props;

  const { ref, inView } = useInView({
    rootMargin: `${windowHeight / 2}px 0px`,
  });

  const ratio = page.height / page.width;

  const wrapperClassName = classnames(styles.previewWrapper, {
    [styles.previewWrapperFavorite]: !!page.favorite,
  });

  return (
    <div className={styles.preview} key={index} ref={ref}>
      <div
        className={wrapperClassName}
        onClick={(e) => onPreviewClick(e, index)}
      >
        <div
          className={styles.previewPadding}
          style={{
            paddingTop: `${ratio * 100}%`,
          }}
        />
        {inView ? (
          <Image
            className={styles.previewImage}
            src={getBookPreviewURL(id, preview.index)}
          />
        ) : null}
        {selected ? <div className={styles.previewSelectedOverlay} /> : null}
      </div>
      <div
        className={styles.previewStarIconWrapper}
        onClick={() => onPageFavoriteUpdate(index, Math.abs(page.favorite - 1))}
      >
        {page.favorite ? (
          <IconStarFilled className={styles.previewStarIcon} />
        ) : (
          <IconStar className={styles.previewStarIcon} />
        )}
      </div>
    </div>
  );
}

function CreateModal(props) {
  const { onClose, startImageNumber = "", endImageNumber = "", bookId } = props;
  const [name, setName] = useState("");
  const [author, setAuthor] = useState("");
  const [libraryId, setLibraryId] = useState("");
  const createSubtitleMutation = useMutation((params) =>
    createSubtitle({
      name: params.name,
      author: params.author,
      pageStartNumber: params.pageStartNumber,
      pageEndNumber: params.pageEndNumber,
      bookId: params.bookId,
      libraryId: params.libraryId,
    }),
  );

  function onCreate() {
    const trimmedName = name.trim();
    const trimmedAuthor = author.trim();
    const trimmedLibraryId = libraryId.trim();
    if (
      trimmedName === "" ||
      trimmedAuthor === "" ||
      trimmedLibraryId === "" ||
      startImageNumber === "" ||
      endImageNumber === ""
    ) {
      return;
    }
    createSubtitleMutation.mutate({
      name: trimmedName,
      author: trimmedAuthor,
      pageStartNumber: startImageNumber,
      pageEndNumber: endImageNumber,
      bookId: bookId,
      libraryId: trimmedLibraryId,
    });
  }

  return (
    <div className={styles.createModal}>
      <div className={styles.createActions}>
        <Button style="transparent" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onCreate} disabled={createSubtitleMutation.isLoading}>
          {createSubtitleMutation.isLoading ? "Creating..." : "Create"}
        </Button>
      </div>
      <div className={styles.createSection}>
        <div className={styles.createField}>
          <p className={styles.createLabel}>Title Name</p>
          <input
            className={styles.createInput}
            placeholder="Please put title name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className={styles.createField}>
          <p className={styles.createLabel}>Title Author</p>
          <input
            className={styles.createInput}
            placeholder="Please put title author..."
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
        <div className={styles.createField}>
          <p className={styles.createLabel}>Library ID</p>
          <input
            className={styles.createInput}
            type="number"
            placeholder="Please put library ID..."
            value={libraryId}
            onChange={(e) => setLibraryId(e.target.value)}
          />
        </div>
        <div className={styles.createField}>
          <p className={styles.createLabel}>Start Image</p>
          <input
            className={styles.createInput}
            placeholder="Please select start image..."
            value={startImageNumber}
            disabled
          />
        </div>
        <div className={styles.createField}>
          <p className={styles.createLabel}>End Image</p>
          <input
            className={styles.createInput}
            value={endImageNumber}
            placeholder="Please select end image..."
            disabled
          />
        </div>
      </div>
    </div>
  );
}
