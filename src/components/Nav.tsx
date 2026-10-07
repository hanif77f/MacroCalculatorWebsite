"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calculators, calculatorHref, calculatorNavigationGroups } from "@/data/calculators";
import ThemeToggle from "./ThemeToggle";

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [calculatorsOpen, setCalculatorsOpen] = useState(false);
  const [dropdownLeft, setDropdownLeft] = useState(16);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [selectedSearchResult, setSelectedSearchResult] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const calculatorNavRef = useRef<HTMLDivElement>(null);
  const mainNavRef = useRef<HTMLElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const calculatorTriggerRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const calculatorDropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return calculators
      .filter((calculator) => calculator.navigationGroup)
      .filter((calculator) => `${calculator.title} ${calculator.shortTitle} ${calculator.description}`.toLowerCase().includes(query))
      .slice(0, 6);
  }, [searchQuery]);
  const searchOpen = searchFocused && searchQuery.trim().length > 0;

  const updateDropdownPosition = useCallback(() => {
    const trigger = calculatorTriggerRef.current;
    const dropdown = calculatorDropdownRef.current;
    if (!trigger || !dropdown) return;

    const viewportWidth = document.documentElement.clientWidth;
    const panelWidth = dropdown.getBoundingClientRect().width;
    const minLeft = 16;
    const maxLeft = Math.max(minLeft, viewportWidth - panelWidth - 16);
    setDropdownLeft(Math.max(minLeft, Math.min(trigger.getBoundingClientRect().left, maxLeft)));
  }, []);

  const openDropdown = useCallback(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    updateDropdownPosition();
    setCalculatorsOpen(true);
  }, [updateDropdownPosition]);

  const scheduleDropdownClose = useCallback(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      if (!calculatorNavRef.current?.contains(document.activeElement)) setCalculatorsOpen(false);
    }, 140);
  }, []);

  useEffect(() => {
    if (!calculatorsOpen) return;

    function closeOnOutsidePointer(event: PointerEvent) {
      if (event.target instanceof Node && !calculatorNavRef.current?.contains(event.target)) {
        setCalculatorsOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCalculatorsOpen(false);
        calculatorTriggerRef.current?.focus();
      }
    }

    function reposition() {
      updateDropdownPosition();
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", reposition);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", reposition);
    };
  }, [calculatorsOpen, updateDropdownPosition]);

  useEffect(() => {
    function closeSearchOnOutsidePointer(event: PointerEvent) {
      if (event.target instanceof Node && !searchRef.current?.contains(event.target)) {
        setSearchFocused(false);
        setSearchExpanded(false);
      }
    }

    document.addEventListener("pointerdown", closeSearchOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeSearchOnOutsidePointer);
  }, []);

  useEffect(() => {
    function closeMobileMenuOnOutsidePointer(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !mainNavRef.current?.contains(event.target) &&
        !mobileMenuButtonRef.current?.contains(event.target)
      ) {
        setMobileMenuOpen(false);
        setCalculatorsOpen(false);
      }
    }

    function closeMobileMenuOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setCalculatorsOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeMobileMenuOnOutsidePointer);
    document.addEventListener("keydown", closeMobileMenuOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeMobileMenuOnOutsidePointer);
      document.removeEventListener("keydown", closeMobileMenuOnEscape);
    };
  }, []);

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  useEffect(() => {
    function updateScrollState() {
      setIsScrolled(window.scrollY > 12);
    }

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  const isCalculatorPage = pathname === "/" || pathname.startsWith("/calculators/");

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setSearchFocused(false);
      setSearchExpanded(false);
      return;
    }
    if (!searchResults.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedSearchResult((index) => (index + 1) % searchResults.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedSearchResult((index) => (index - 1 + searchResults.length) % searchResults.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      router.push(calculatorHref(searchResults[selectedSearchResult]));
      setSearchFocused(false);
      setSearchExpanded(false);
      setSearchQuery("");
    }
  }

  return (
    <header className="site-nav" data-scrolled={isScrolled}>
      <div className="nav-inner">
        <Link href="/" className="brand-mark">
          <Image alt="" aria-hidden="true" className="brand-logo" height={36} src="/images/logo/logo.webp" width={36} />
          <b><span className="brand-macro">Macro</span>Calculators</b>
        </Link>
        <div className="nav-tools">
          <nav
            aria-label="Main navigation"
            className="main-nav"
            data-mobile-open={mobileMenuOpen}
            id="mobile-main-nav"
            ref={mainNavRef}
          >
            <div
              className="calculator-nav"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setCalculatorsOpen(false);
              }}
              onMouseEnter={openDropdown}
              onMouseLeave={scheduleDropdownClose}
              ref={calculatorNavRef}
            >
              <button
                type="button"
                aria-controls="calculator-dropdown"
                aria-expanded={calculatorsOpen}
                aria-haspopup="true"
                className="calculator-menu-trigger"
                data-active={isCalculatorPage}
                onClick={() => {
                  if (window.matchMedia("(max-width: 860px)").matches) {
                    setCalculatorsOpen((open) => !open);
                  } else {
                    updateDropdownPosition();
                    setCalculatorsOpen(true);
                  }
                }}
                ref={calculatorTriggerRef}
              >
                Calculators <span aria-hidden="true" className="calculator-menu-caret" />
              </button>
              <div
                aria-hidden={!calculatorsOpen}
                className={`calculator-dropdown${calculatorsOpen ? " is-open" : ""}`}
                id="calculator-dropdown"
                inert={!calculatorsOpen}
                onMouseEnter={openDropdown}
                onMouseLeave={scheduleDropdownClose}
                ref={calculatorDropdownRef}
                style={{ left: `${dropdownLeft}px` }}
              >
                <div className="calculator-dropdown-heading">
                  <div>
                    <span>Find your starting point</span>
                    <strong>Explore calculators</strong>
                  </div>
                  <Link href="/calculators" onClick={() => {
                    setCalculatorsOpen(false);
                    setMobileMenuOpen(false);
                  }}>
                    All calculators <span aria-hidden="true">↗</span>
                  </Link>
                </div>
                <div className="calculator-dropdown-groups">
                  {calculatorNavigationGroups.map((group) => {
                    const groupCalculators = calculators
                      .filter((calculator) => calculator.navigationGroup === group.id)
                      .sort((a, b) => (a.navigationOrder ?? Number.MAX_SAFE_INTEGER) - (b.navigationOrder ?? Number.MAX_SAFE_INTEGER));

                    if (groupCalculators.length === 0) return null;

                    return (
                      <section aria-labelledby={`calculator-group-${group.id}`} className="calculator-dropdown-group" key={group.id}>
                        <p id={`calculator-group-${group.id}`}>{group.label}</p>
                        <ul>
                          {groupCalculators.map((calculator) => {
                            const href = calculatorHref(calculator);
                            const isCurrent = pathname === href;
                            return (
                              <li key={calculator.slug}>
                                <Link
                                  aria-current={isCurrent ? "page" : undefined}
                                  className={`calculator-dropdown-link calculator-dropdown-link-${calculator.slug}`}
                                  href={href}
                                  onClick={() => {
                                    setCalculatorsOpen(false);
                                    setMobileMenuOpen(false);
                                  }}
                                >
                                  {calculator.title}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </section>
                    );
                  })}
                </div>
              </div>
            </div>
            <Link href="/about" onClick={() => {
              setMobileMenuOpen(false);
              setCalculatorsOpen(false);
            }}>About</Link>
            <Link href="/contact" onClick={() => {
              setMobileMenuOpen(false);
              setCalculatorsOpen(false);
            }}>Contact</Link>
          </nav>
          <button
            aria-controls="mobile-main-nav"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="nav-mobile-menu-trigger"
            onClick={() => {
              const opening = !mobileMenuOpen;
              setMobileMenuOpen(opening);
              setCalculatorsOpen(opening);
            }}
            ref={mobileMenuButtonRef}
            type="button"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              {mobileMenuOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
          <div className={`nav-search-wrap${searchExpanded ? " is-expanded" : ""}`} ref={searchRef}>
            <label className="nav-search" htmlFor="nav-calculator-search">
              <input
                aria-activedescendant={searchOpen && searchResults.length ? `calculator-search-result-${selectedSearchResult}` : undefined}
                aria-autocomplete="list"
                aria-controls="calculator-search-results"
                aria-expanded={searchOpen}
                aria-label="Search calculators"
                autoComplete="off"
                id="nav-calculator-search"
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setSelectedSearchResult(0);
                }}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search calculators..."
                role="combobox"
                ref={searchInputRef}
                value={searchQuery}
              />
              <span aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.3 4.3" /></svg>
              </span>
            </label>
            <button
              aria-label="Close calculator search"
              className="nav-search-close"
              onClick={() => {
                setSearchFocused(false);
                setSearchExpanded(false);
              }}
              type="button"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
            <button
              aria-label="Open calculator search"
              className="nav-search-mobile-trigger"
              onClick={() => {
                setSearchExpanded(true);
                requestAnimationFrame(() => searchInputRef.current?.focus());
              }}
              type="button"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.3 4.3" /></svg>
            </button>
            {searchOpen && (
              <div className="nav-search-results" id="calculator-search-results" role="listbox" aria-label="Calculator suggestions">
                {searchResults.length ? searchResults.map((calculator, index) => (
                  <Link
                    aria-selected={selectedSearchResult === index}
                    className="nav-search-result"
                    href={calculatorHref(calculator)}
                    id={`calculator-search-result-${index}`}
                    key={calculator.slug}
                    onClick={() => {
                      setSearchFocused(false);
                      setSearchQuery("");
                    }}
                    role="option"
                    tabIndex={-1}
                  >
                    <span>{calculator.title}</span>
                    <span aria-hidden="true">↗</span>
                  </Link>
                )) : <p className="nav-search-empty" role="option" aria-selected="false">No calculators found</p>}
              </div>
            )}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
