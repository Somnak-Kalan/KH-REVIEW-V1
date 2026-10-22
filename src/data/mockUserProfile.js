// src/data/mockUserProfile.js

export const mockUser = {
    id: 1,
    fullName: 'Sophea Chan',
    nickname: 'Nickname',
    gender: 'Male',
    phone: '+855 12 345 678',
    email: 'sophea.chan@email.com',
    location: 'Phnom Penh',
    role: 'normal', // try: 'content_creator' or 'business_owner'
    status: 'active', // active | inactive
    followings: 2400,
    lastActive: '1/28/2024',
    createdAt: '1/15/2024',
    avatarLetter: 'S',
}

export const placeStats = [
    { key: 'reviewed', label: 'Reviewed', value: 18, bg: 'bg-orange-50' },
    { key: 'saved', label: 'Saved', value: 89, bg: 'bg-blue-50' },
    { key: 'shared', label: 'Shared', value: 12, bg: 'bg-purple-50' },
    { key: 'viewed', label: 'Viewed', value: 89, bg: 'bg-sky-50' },
]

export const momentsStats = [
    { key: 'viewed', label: 'Viewed', value: 89, bg: 'bg-blue-50' },
    { key: 'liked', label: 'Liked', value: 34, bg: 'bg-green-50' },
    { key: 'saved', label: 'Saved', value: 89, bg: 'bg-sky-50' },
    { key: 'shared', label: 'Shared', value: 12, bg: 'bg-purple-50' },
    { key: 'repost', label: 'Reposts', value: 14, bg: 'bg-[#4A4A5117]' },
    { key: 'comments', label: 'Comments', value: 18, bg: 'bg-orange-50' },
]

const imgs = [
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=300',
    'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=300',
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=300',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=300',
]

export const placeTimeline = Array.from({ length: 24 }).map((_, i) => ({
    id: `place-${i + 1}`,
    type: i % 4 === 0 ? 'view' : i % 4 === 1 ? 'review' : i % 4 === 2 ? 'share' : 'save',
    title: i % 4 === 0 ? 'Viewed place “Angkor Wat”'
        : i % 4 === 1 ? 'Reviewed place “Angkor Wat”'
            : i % 4 === 2 ? 'Shared place “Angkor Wat”'
                : 'Saved place “Angkor Wat”',
    category: 'Attraction',
    actionTag: i % 4 === 1 ? 'review' : i % 4 === 2 ? 'share' : i % 4 === 3 ? 'save' : 'View',
    rating: i % 4 === 1 ? '5/5' : null,
    desc:
        i % 4 === 1
            ? 'Angkor is one of the most important archaeological sites in South-East Asia. Stretching over some 400 km2...'
            : '',
    images: i % 4 === 1 && i % 2 === 0 ? imgs : i % 4 === 1 ? imgs.slice(0, 2) : [],
    time: '22, Jan at 2:38PM',
}))
export const momentsTimeline = Array.from({ length: 24 }).map((_, i) => ({
    id: `moment-${i + 1}`,
    type:
        i % 6 === 0
            ? 'comment'
            : i % 6 === 1
                ? 'share'
                : i % 6 === 2
                    ? 'view'
                    : i % 6 === 3
                        ? 'like'
                        : i % 6 === 4
                            ? 'save'
                            : 'repost',

    title:
        i % 6 === 0
            ? 'Commented on chan dara’s moment “Angkor Wat”'
            : i % 6 === 1
                ? 'Shared on chan dara’s moment “Angkor Wat”'
                : i % 6 === 2
                    ? 'Viewed on chan dara’s moment “Angkor Wat”'
                    : i % 6 === 3
                        ? 'Liked on chan dara’s moment “Angkor Wat”'
                        : i % 6 === 4
                            ? 'Saved on chan dara’s moment “Angkor Wat”'
                            : 'Reposted on chan dara’s moment “Angkor Wat”',

    subTags:
        i % 6 === 0
            ? ['Post', 'comment']
            : i % 6 === 1
                ? ['Post', 'share']
                : i % 6 === 2
                    ? ['Post', 'view']
                    : i % 6 === 3
                        ? ['Post', 'like']
                        : i % 6 === 4
                            ? ['Post', 'save']
                            : ['Post', 'repost'],

    place: 'Angkor Wat, Siem Reap',

    desc:
        i % 6 === 0
            ? 'Angkor is one of the most important archaeological sites in South-East Asia. Stretching over some 400 km2...'
            : '',

    images: i % 6 === 0 && i % 2 === 0 ? imgs : [],

    // added for right side stats
    likes: 23 + i,
    unlikes: i % 3,

    // added for dayjs format
    createdAt: '2026-01-22T14:38:00',

    // keep your old time also, no delete
    time: '22, Jan at 2:38PM',
}))