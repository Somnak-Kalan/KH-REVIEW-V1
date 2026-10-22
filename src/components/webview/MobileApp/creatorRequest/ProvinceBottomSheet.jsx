import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useShallow } from "zustand/react/shallow";
import { useProvinceStore } from "../../../../Stores/Province/province.store";

const ANIMATION_MS = 320;

const FALLBACK_IMAGE =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
      <rect width="80" height="80" rx="40" fill="#EDE7F6"/>
      <circle cx="40" cy="30" r="12" fill="#C7B7F5"/>
      <path d="M18 62c5-10 15-16 22-16s17 6 22 16" fill="#C7B7F5"/>
    </svg>
  `);

const getProvinceId = (item) =>
    String(
        item?._id ??
        item?.provinceId ??
        item?.id ??
        item?.province_id ??
        item?.value ??
        ""
    );

const getProvinceNameEn = (item) =>
    item?.provinceEn ??
    item?.nameEn ??
    item?.provinceNameEn ??
    item?.province_name_en ??
    item?.name ??
    item?.label ??
    "";

const getProvinceNameKh = (item) =>
    item?.provinceKh ??
    item?.nameKh ??
    item?.provinceNameKh ??
    item?.province_name_kh ??
    item?.khName ??
    item?.labelKh ??
    "";

const getProvinceImage = (item) =>
    item?.images?.[3] ??
    item?.images?.[2] ??
    item?.images?.[1] ??
    item?.images?.[0] ??
    item?.image ??
    item?.imageUrl ??
    item?.thumbnail ??
    item?.icon ??
    item?.photo ??
    item?.avatar ??
    item?.cover ??
    item?.logo ??
    FALLBACK_IMAGE;

const normalizeProvinceList = (provinces) => {
    if (Array.isArray(provinces)) return provinces;
    if (Array.isArray(provinces?.data)) return provinces.data;
    return [];
};

function SearchIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M20 6L9 17l-5-5" />
        </svg>
    );
}

function Spinner() {
    return (
        <span
            aria-hidden="true"
            style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: "2px solid rgba(143,98,255,0.25)",
                borderTopColor: "#8F62FF",
                display: "inline-block",
                animation: "province-spin 0.8s linear infinite",
            }}
        />
    );
}

function SkeletonRow() {
    return (
        <div className="flex items-center gap-3 py-4">
            <div className="h-[54px] w-[54px] animate-pulse rounded-full bg-[#F1F1F1]" />
            <div className="min-w-0 flex-1">
                <div className="h-[16px] w-[150px] animate-pulse rounded bg-[#F1F1F1]" />
                <div className="mt-2 h-[12px] w-[90px] animate-pulse rounded bg-[#F5F5F5]" />
            </div>
            <div className="h-[24px] w-[24px] animate-pulse rounded-full bg-[#F3F3F3]" />
        </div>
    );
}

export default function ProvinceBottomSheet({
    open = false,
    onClose,
    onConfirm,
    value = null,
    title = "Province",
}) {
    const { provinces, fetchProvinces, loading } = useProvinceStore(
        useShallow((state) => ({
            provinces: state.provinces,
            fetchProvinces: state.fetchProvinces,
            loading: state.loading,
        }))
    );

    const [keyword, setKeyword] = useState("");
    const [selectedId, setSelectedId] = useState(
        value ? (typeof value === "object" ? getProvinceId(value) : String(value)) : ""
    );
    const [rendered, setRendered] = useState(false);
    const [active, setActive] = useState(false);
    const [cachedProvinces, setCachedProvinces] = useState([]);

    const inputRef = useRef(null);
    const openRafRef = useRef(null);
    const closeTimerRef = useRef(null);

    const provinceList = useMemo(() => normalizeProvinceList(provinces), [provinces]);

    useEffect(() => {
        if (provinceList.length > 0) {
            setCachedProvinces(provinceList);
        }
    }, [provinceList]);

    const displayProvinces = provinceList.length > 0 ? provinceList : cachedProvinces;

    useEffect(() => {
        if (!open) return;
        if (displayProvinces.length > 0) return;
        if (loading) return;
        fetchProvinces();
    }, [open, displayProvinces.length, loading, fetchProvinces]);

    useEffect(() => {
        if (!open) return;

        const nextId = value
            ? typeof value === "object"
                ? getProvinceId(value)
                : String(value)
            : "";

        setSelectedId(nextId);
    }, [value, open]);

    useEffect(() => {
        if (!open) {
            setKeyword("");
            if (inputRef.current) inputRef.current.blur();
        }
    }, [open]);

    useLayoutEffect(() => {
        if (open) {
            setRendered(true);
            return;
        }

        setActive(false);

        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
        }

        closeTimerRef.current = setTimeout(() => {
            setRendered(false);
        }, ANIMATION_MS);

        return () => {
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        };
    }, [open]);

    useLayoutEffect(() => {
        if (!rendered) return;

        if (openRafRef.current) cancelAnimationFrame(openRafRef.current);

        openRafRef.current = requestAnimationFrame(() => {
            setActive(open);
        });

        return () => {
            if (openRafRef.current) cancelAnimationFrame(openRafRef.current);
        };
    }, [rendered, open]);

    useEffect(() => {
        if (!rendered) return;

        const previousOverflow = document.body.style.overflow;
        const previousOverscroll = document.body.style.overscrollBehavior;

        document.body.style.overflow = "hidden";
        document.body.style.overscrollBehavior = "none";

        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.style.overscrollBehavior = previousOverscroll;
        };
    }, [rendered]);

    useEffect(() => {
        if (!rendered) return;

        const onKeyDown = (e) => {
            if (e.key === "Escape") onClose?.();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [rendered, onClose]);

    const filteredProvinces = useMemo(() => {
        const q = keyword.trim().toLowerCase();

        if (!q) return displayProvinces;

        return displayProvinces.filter((item) => {
            const en = String(getProvinceNameEn(item)).toLowerCase();
            const kh = String(getProvinceNameKh(item)).toLowerCase();
            const code = String(item?.provinceCode ?? "").toLowerCase();
            return en.includes(q) || kh.includes(q) || code.includes(q);
        });
    }, [displayProvinces, keyword]);

    const selectedProvince = useMemo(() => {
        return (
            displayProvinces.find(
                (item) => getProvinceId(item) === String(selectedId)
            ) || null
        );
    }, [displayProvinces, selectedId]);

    const handleClose = () => {
        onClose?.();
    };

    const handleSelectProvince = (id) => {
        setSelectedId(id);
    };

    const handleConfirm = () => {
        if (!selectedProvince) return;
        onConfirm?.(selectedProvince);
        onClose?.();
    };

    if (!rendered) return null;

    return createPortal(
        <>
            <style>{`
                @keyframes province-spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>

            <div
                className="fixed inset-0 z-[60]"
                role="dialog"
                aria-modal="true"
            >
                <div
                    className="absolute inset-0 bg-black/25"
                    onClick={handleClose}
                    style={{
                        opacity: active ? 1 : 0,
                        transition: "opacity 220ms ease",
                    }}
                />

                <div className="absolute inset-0 overflow-hidden">
                    <div
                        className="absolute inset-x-0 top-0 bottom-0 bg-white rounded-t-[28px]"
                        style={{
                            transform: active
                                ? "translate3d(0,0,0)"
                                : "translate3d(0,100%,0)",
                            transition: `transform ${ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                            boxShadow: "0 -10px 30px rgba(0,0,0,0.14)",
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                        }}
                    >
                        {/* <div className="flex h-full min-h-0 flex-col bg-white"> */}
                        <div className="relative flex h-full min-h-0 flex-col bg-white">
                            <div
                                className="shrink-0 mx-auto w-full max-w-2xl border-b border-[#F1F1F1] bg-white pt-[max(12px,env(safe-area-inset-top))] pb-3 rounded-t-[28px]"
                                style={{
                                    WebkitBackdropFilter: "blur(8px)",
                                    backdropFilter: "blur(8px)",
                                }}
                            >
                                <div className="mx-auto mb-3 h-[5px] w-full rounded-full bg-[#D9D9D9]" />

                                <div className="relative flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-[#444]"
                                    >
                                        <CloseIcon />
                                    </button>

                                    <div className="pointer-events-none absolute left-1/2 w-[60%] -translate-x-1/2 truncate text-center text-[20px] font-semibold text-[#1F1F1F]">
                                        {title}
                                    </div>

                                    <div className="w-10" />
                                </div>

                                <div className="mt-3">
                                    <div className="flex h-[48px] items-center rounded-full bg-[#F5F1FB] px-4">
                                        <span className="mr-3 text-[#4A4A4A]">
                                            <SearchIcon />
                                        </span>

                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={keyword}
                                            onChange={(e) => setKeyword(e.target.value)}
                                            placeholder="Search province"
                                            autoComplete="off"
                                            autoCorrect="off"
                                            autoCapitalize="none"
                                            spellCheck={false}
                                            enterKeyHint="search"
                                            className="h-full w-full border-0 bg-transparent text-[16px] text-[#1F1F1F] outline-none placeholder:text-[#A4A9B6]"
                                            style={{
                                                fontSize: "16px",
                                                WebkitTextSizeAdjust: "100%",
                                                WebkitAppearance: "none",
                                                appearance: "none",
                                                outline: "none",
                                                boxShadow: "none",
                                                background: "transparent",
                                                caretColor: "#1F1F1F",
                                            }}
                                        />

                                        {loading && displayProvinces.length > 0 ? (
                                            <span className="ml-2 text-[#8F62FF]">
                                                <Spinner />
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <div
                                className="min-h-0 flex-1 overflow-y-auto px-4"
                                style={{
                                    WebkitOverflowScrolling: "touch",
                                    overscrollBehavior: "contain",
                                    paddingBottom: "110px",
                                }}
                            >
                                <div className="mx-auto w-full max-w-2xl">
                                    {displayProvinces.length === 0 && loading ? (
                                        <div className="divide-y divide-[#ECECEC]">
                                            <SkeletonRow />
                                            <SkeletonRow />
                                            <SkeletonRow />
                                            <SkeletonRow />
                                            <SkeletonRow />
                                        </div>
                                    ) : filteredProvinces.length === 0 ? (
                                        <div className="flex h-full min-h-[240px] items-center justify-center py-10 text-center text-[14px] text-[#8B8B8B]">
                                            No province found
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-[#ECECEC]">
                                            {filteredProvinces.map((item) => {
                                                const id = getProvinceId(item);
                                                const nameEn = getProvinceNameEn(item);
                                                const nameKh = getProvinceNameKh(item);
                                                const image = getProvinceImage(item);
                                                const activeItem =
                                                    String(selectedId) === String(id);

                                                return (
                                                    <button
                                                        key={id}
                                                        type="button"
                                                        onClick={() => handleSelectProvince(id)}
                                                        className="flex w-full items-center gap-3 py-4 text-left"
                                                    >
                                                        <img
                                                            src={image}
                                                            alt={nameEn || "province"}
                                                            className="h-[54px] w-[54px] rounded-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.src = FALLBACK_IMAGE;
                                                            }}
                                                        />

                                                        <div className="min-w-0 flex-1">
                                                            <div className="truncate text-[16px] font-semibold text-[#333333]">
                                                                {nameEn}
                                                            </div>
                                                            <div className="mt-1 truncate text-[13px] text-[#9B9B9B]">
                                                                {nameKh}
                                                            </div>
                                                        </div>

                                                        <div
                                                            className={`flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border ${activeItem
                                                                ? "border-[#8F62FF] bg-[#8F62FF] text-white"
                                                                : "border-[#D9D9D9] bg-white text-transparent"
                                                                }`}
                                                        >
                                                            <CheckIcon />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div
                                className="absolute inset-x-0 bottom-0 border-t border-[#F1F1F1] bg-white px-4 pt-3"
                                style={{
                                    paddingBottom: "max(12px, env(safe-area-inset-bottom))",
                                    zIndex: 30,
                                }}
                            >
                                <div className="mx-auto w-full max-w-2xl">
                                    <button
                                        type="button"
                                        disabled={!selectedProvince}
                                        onClick={handleConfirm}
                                        className={`h-[52px] w-full rounded-full text-[18px] font-semibold ${selectedProvince
                                            ? "bg-[#8F62FF] text-white"
                                            : "bg-[#F1F1F1] text-[#C2C2C2]"
                                            }`}
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}