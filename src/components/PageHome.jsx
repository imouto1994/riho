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
import { IconEn } from "./IconEn";
import { IconJp } from "./IconJp";
import { IconUncensored } from "./IconUncensored";
import {
  KEY_LIBRARIES,
  KEY_TITLES,
  KEY_TITLES_COUNT,
} from "../constants/query-key";
import { useLockBodyScroll } from "../hooks/lock-body-scroll";
import { getLibraries } from "../services/library";
import { getTitles, countTitles, getTitleCoverURL } from "../services/title";
import { parseTitleName } from "../utils/string";

import styles from "./PageHome.module.css";

const PAGE_SIZE = 24;

export function PageHome() {
  const history = useHistory();
  const params = queryString.parse(window.location.search, {
    arrayFormat: "none",
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

  // Fetch the list of titles based on search query and filters
  const {
    status: titlesFetchStatus,
    data: titles,
    error: titlesFetchError,
  } = useQuery(
    [KEY_TITLES, queryPage, queryLibraries, querySort, querySearch],
    () =>
      getTitles({
        page: queryPage,
        libraryId: queryLibraries,
        sort: querySort,
        search: querySearch,
        size: PAGE_SIZE,
      }),
    {
      keepPreviousData: true,
    },
  );
  const {
    status: countFetchStatus,
    data: count,
    error: countFetchError,
  } = useQuery([KEY_TITLES_COUNT, queryLibraries, querySearch], () =>
    countTitles({
      libraryId: queryLibraries,
      search: querySearch,
    }),
  );

  function getPageUrl(page) {
    const pageIndex = page - 1;
    if (pageIndex === 0) {
      delete params.page;
    } else {
      params.page = pageIndex;
    }
    const newLocationSearch = queryString.stringify(params, {
      arrayFormat: "none",
    });

    return `/${newLocationSearch.length > 0 ? `?${newLocationSearch}` : ""}`;
  }

  function renderContent() {
    if (titlesFetchStatus === "loading") {
      return (
        <div className={styles.loadingContainer}>
          <Loading className={styles.loadingIcon} />
        </div>
      );
    }
    const pageNumber = parseInt(queryPage || "0", 10);

    return (
      <>
        <TitlesGrid titles={titles} />
        {count != null ? (
          <Pagination
            count={Math.ceil(count.value / PAGE_SIZE)}
            page={pageNumber + 1}
            getPageUrl={getPageUrl}
          />
        ) : null}
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
        sort: newQuerySort === "created_at" ? undefined : newQuerySort,
      },
      { arrayFormat: "none" },
    );

    setShowFilterModal(false);
    history.push(
      `/${newLocationSearch.length > 0 ? `?${newLocationSearch}` : ""}`,
    );
  }

  function onSearch(newQuerySearch) {
    delete params.page;
    if (newQuerySearch.trim() === "") {
      delete params.search;
    } else {
      params.search = newQuerySearch;
    }
    const newLocationSearch = queryString.stringify(params, {
      arrayFormat: "none",
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

function TitlesGrid(props) {
  const { titles } = props;
  if (titles == null) {
    return null;
  }

  return (
    <ul className={styles.titlesGrid}>
      {titles.map((title) => {
        const {
          title: titleName,
          author,
          circle,
          date,
        } = parseTitleName(title.name);

        return (
          <li className={styles.titleEntry} key={title.id}>
            <Link className={styles.linkContainer} to={`/title/${title.id}`}>
              <div className={styles.thumbnailWrapper}>
                <div
                  className={styles.thumbnailPadding}
                  style={{
                    paddingTop: `${
                      (title.cover_height * 100) / title.cover_width
                    }%`,
                  }}
                />
                <Image
                  className={styles.thumbnail}
                  src={getTitleCoverURL(title.id)}
                />
              </div>
              <p className={styles.title}>{titleName}</p>
              <p className={styles.subtitle}>{`${author}${
                !!circle ? ` | ${circle}` : ""
              }`}</p>
              <div className={styles.description}>
                <div className={styles.langIcons}>
                  {title.langs.split(",").map((lang) => {
                    if (lang === "EN") {
                      return <IconEn className={styles.langIcon} key={lang} />;
                    } else if (lang === "JP") {
                      return <IconJp className={styles.langIcon} key={lang} />;
                    } else {
                      return null;
                    }
                  })}
                  {!!title.uncensored ? (
                    <IconUncensored className={styles.langIcon} />
                  ) : null}
                </div>
                <p className={styles.date}>{date}</p>
              </div>
            </Link>
          </li>
        );
      })}
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
        placeholder="Search titles..."
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
  const [sortFilter, setSortFilter] = useState(querySort || "created_at");

  useEffect(() => {
    setLibrariesFilter(new Set(queryLibraries || []));
  }, [queryLibraries]);

  useEffect(() => {
    setSortFilter(querySort || "created_at");
  }, [querySort]);

  function renderSortOption(type, text) {
    const isSelected = type === sortFilter;
    const iconClassName = classnames(styles.filterOptionIcon, {
      [styles.filterOptionIconHidden]: !isSelected,
    });

    return (
      <div className={styles.filterOption} onClick={() => onSortSelect(type)}>
        {sortFilter === "name" ? (
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
    if (newLibrariesFilter.has(`${library.id}`)) {
      newLibrariesFilter.delete(`${library.id}`);
    } else {
      newLibrariesFilter.add(`${library.id}`);
    }
    setLibrariesFilter(newLibrariesFilter);
  }

  function onSortSelect(selectedType) {
    if (sortFilter != selectedType) {
      setSortFilter(selectedType);
    }
  }

  function onReset() {
    setLibrariesFilter(new Set([]));
    setSortFilter("created_at");
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
            const isSelected = librariesFilter.has(`${library.id}`);
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
          {renderSortOption("name", "Alphabetically")}
          {renderSortOption("created_at", "Date published")}
          {renderSortOption("updated_at", "Date modified")}
        </div>
      </div>
    </>
  );
}
