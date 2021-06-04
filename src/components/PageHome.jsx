import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "react-query";
import { Link, useHistory } from "react-router-dom";
import classnames from "classnames";
import queryString from "query-string";

import { Button } from "./Button";
import { Loading } from "./Loading";
import { Image } from "./Image";
import { Pagination } from "./Pagination";
import { IconCheck } from "./IconCheck";
import { IconAscending } from "./IconAscending";
import { IconDescending } from "./IconDescending";
import { IconFilter } from "./IconFilter";
import { KEY_LIBRARIES, KEY_SERIES } from "../constants/query-key";
import { useLockBodyScroll } from "../hooks/lock-body-scroll";
import { getLibraries } from "../services/library";
import { getSeries, getSeriesThumbnailUrl } from "../services/series";

import styles from "./PageHome.module.css";

export function PageHome() {
  const history = useHistory();
  const params = queryString.parse(window.location.search, {
    arrayFormat: "index",
  });
  const {
    libraries: queryLibraries,
    sort: querySort,
    page: queryPage,
    search: querySearch,
  } = params;
  const [inputSearch, setInputSearch] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Fetch libraries
  const {
    status: librariesFetchStatus,
    data: libraries,
    error: librariesFetchError,
  } = useQuery(KEY_LIBRARIES, getLibraries, { initialData: [] });

  // Fetch the list of series based on search query and filters
  const {
    status: seriesFetchStatus,
    data: seriesQueryResult,
    error: seriesFetchError,
  } = useQuery(
    [KEY_SERIES, queryPage, queryLibraries, querySort, querySearch],
    () =>
      getSeries({
        page: queryPage,
        libraryId: queryLibraries,
        sort: querySort,
        search: querySearch,
      }),
    {
      keepPreviousData: true,
    },
  );

  function getPageUrl(page) {
    const pageIndex = page - 1;
    if (pageIndex === 0) {
      delete params.page;
    } else {
      params.page = pageIndex;
    }
    const newLocationSearch = queryString.stringify(params, {
      arrayFormat: "index",
    });

    return `/${newLocationSearch.length > 0 ? `?${newLocationSearch}` : ""}`;
  }

  function renderContent() {
    if (seriesFetchStatus === "loading") {
      return (
        <div className={styles.loadingContainer}>
          <Loading className={styles.loadingIcon} />
        </div>
      );
    }
    const { totalPages, number: pageNumber } = seriesQueryResult;

    return (
      <>
        <SeriesGrid result={seriesQueryResult} />
        <Pagination
          count={totalPages}
          page={pageNumber + 1}
          getPageUrl={getPageUrl}
        />
      </>
    );
  }

  function onFilter(newQueryLibraries, newQuerySort) {
    const newLocationSearch = queryString.stringify(
      {
        libraries:
          newQueryLibraries.length === 0 ||
          newQueryLibraries.length === libraries.length
            ? undefined
            : newQueryLibraries,
        sort: newQuerySort === "createdDate,desc" ? undefined : newQuerySort,
      },
      { arrayFormat: "index" },
    );

    setShowFilterModal(false);
    history.push(
      `/${newLocationSearch.length > 0 ? `?${newLocationSearch}` : ""}`,
    );
  }

  function onSearch(newQuerySearch) {
    if (newQuerySearch.trim() === "") {
      delete params.search;
    } else {
      params.search = newQuerySearch;
    }
    const newLocationSearch = queryString.stringify(params, {
      arrayFormat: "index",
    });
    history.push(
      `/${newLocationSearch.length > 0 ? `?${newLocationSearch}` : ""}`,
    );
  }

  return (
    <>
      <Header
        onFilterButtonClick={() => setShowFilterModal(true)}
        querySearch={querySearch}
        onSearch={onSearch}
      />
      {renderContent()}
      {showFilterModal && (
        <FilterModal
          onCancel={() => setShowFilterModal(false)}
          libraries={libraries}
          queryLibraries={queryLibraries}
          querySort={querySort}
          onFilter={onFilter}
        />
      )}
    </>
  );
}

function SeriesGrid(props) {
  const { result } = props;
  if (result == null) {
    return null;
  }

  return (
    <ul className={styles.seriesGrid}>
      {result.content.map((series) => (
        <li className={styles.series} key={series.id}>
          <Link className={styles.linkContainer} to={`/series/${series.id}`}>
            <div className={styles.thumbnailWrapper}>
              <Image
                className={styles.thumbnail}
                src={getSeriesThumbnailUrl(series.id)}
              />
            </div>
            <p className={styles.title}>{series.name}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Header(props) {
  const { onFilterButtonClick, querySearch, onSearch } = props;
  const [searchValue, setSearchValue] = useState(querySearch || "");
  const headerElement = useRef(null);

  useEffect(() => {
    setSearchValue(querySearch || "");
  }, [querySearch]);

  useEffect(() => {
    let prevScrollOffset = 0;
    let translateTop = 0;

    function onScroll() {
      const scrollOffset =
        document.documentElement.scrollTop || document.body.scrollTop;
      const headerHeight = headerElement.current.offsetHeight;
      const diff = scrollOffset - prevScrollOffset;

      const prevTranslateTop = translateTop;
      translateTop = translateTop + diff;
      translateTop = Math.min(translateTop, headerHeight);
      translateTop = Math.max(translateTop, 0);

      if (translateTop !== prevTranslateTop) {
        headerElement.current.style.top = `-${translateTop}px`;
      }

      prevScrollOffset = scrollOffset;
    }

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function onKeyPress(e) {
    if (event.charCode === 13) {
      onSearch(searchValue);
    }
  }

  return (
    <div className={styles.header} ref={headerElement}>
      <input
        type="search"
        className={styles.headerSearchInput}
        placeholder="Search series..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyPress={onKeyPress}
      />
      <button className={styles.headerFilter} onClick={onFilterButtonClick}>
        <IconFilter className={styles.headerFilterIcon} />
      </button>
    </div>
  );
}

function FilterModal(props) {
  const { filter, onCancel, libraries, queryLibraries, querySort, onFilter } =
    props;

  useLockBodyScroll();
  const [librariesFilter, setLibrariesFilter] = useState(
    new Set(queryLibraries || []),
  );
  const [sortFilter, setSortFilter] = useState(querySort || "createdDate,desc");

  useEffect(() => {
    setLibrariesFilter(new Set(queryLibraries || []));
  }, [queryLibraries]);

  useEffect(() => {
    setSortFilter(querySort || "createdDate,desc");
  }, [querySort]);

  const [sortType, sortDirection] = sortFilter.split(",");

  function renderSortOption(type, text) {
    const isSelected = type === sortType;
    const iconClassName = classnames(styles.filterOptionIcon, {
      [styles.filterOptionIconHidden]: !isSelected,
    });

    return (
      <div className={styles.filterOption} onClick={() => onSortSelect(type)}>
        {sortDirection === "asc" ? (
          <IconAscending className={iconClassName} />
        ) : (
          <IconDescending className={iconClassName} />
        )}
        <p className={styles.filterOptionTitle}>{text}</p>
      </div>
    );
  }

  function onLibrarySelect(library) {
    const newLibrariesFilter = new Set(librariesFilter);
    if (newLibrariesFilter.has(library.id)) {
      newLibrariesFilter.delete(library.id);
    } else {
      newLibrariesFilter.add(library.id);
    }
    setLibrariesFilter(newLibrariesFilter);
  }

  function onSortSelect(selectedType) {
    if (sortType === selectedType) {
      setSortFilter(`${sortType},${sortDirection === "asc" ? "desc" : "asc"}`);
    } else {
      setSortFilter(`${selectedType},asc`);
    }
  }

  function onReset() {
    setLibrariesFilter(new Set([]));
    setSortFilter("createdDate,desc");
  }

  function onFilterButtonClick() {
    const newQueryLibraries = Array.from(librariesFilter);
    newQueryLibraries.sort((strA, strB) => (strA > strB) - (strA < strB));
    onFilter(newQueryLibraries, sortFilter);
  }

  return (
    <>
      <div className={styles.filterModalOverlay} onClick={onCancel} />
      <div className={styles.filterModal}>
        <div className={styles.filterActions}>
          <Button style="transparent" onClick={onReset}>
            Reset
          </Button>
          <Button onClick={onFilterButtonClick}>Filter</Button>
        </div>
        <div className={styles.filterSection}>
          <p className={styles.filterSectionTitle}>Libraries</p>
          {libraries.map((library) => {
            const isSelected = librariesFilter.has(library.id);
            const iconClassName = classnames(styles.filterOptionIcon, {
              [styles.filterOptionIconHidden]: !isSelected,
            });

            return (
              <div
                className={styles.filterOption}
                key={library.id}
                onClick={() => onLibrarySelect(library)}
              >
                <IconCheck className={iconClassName} />
                <p className={styles.filterOptionTitle}>{library.name}</p>
              </div>
            );
          })}
        </div>
        <div className={styles.filterSection}>
          <p className={styles.filterSectionTitle}>Sort</p>
          {renderSortOption("metadata.titleSort", "Alphabetically")}
          {renderSortOption("createdDate", "Date added")}
        </div>
      </div>
    </>
  );
}
