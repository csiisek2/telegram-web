export const initialFreePosts = [];

export const initialScammerPosts = [];

// Simple in-memory store (will reset on page refresh, but persists on client-side routing)
class PostStore {
    constructor() {
        this.freePosts = [...initialFreePosts];
        this.scammerPosts = [...initialScammerPosts];
        this.listeners = [];
    }

    getFreePosts() {
        return this.freePosts;
    }

    getScammerPosts() {
        return this.scammerPosts;
    }

    addFreePost(post) {
        this.freePosts = [post, ...this.freePosts];
        this.notify();
    }

    addScammerPost(post) {
        this.scammerPosts = [post, ...this.scammerPosts];
        this.notify();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener());
    }
}


export const postStore = new PostStore();

// --- Admin / Site Config Store (Persisted in LocalStorage) ---

export const initialBanners = [
    {
        id: 1,
        title: '도살장',
        text: '도살장',
        image: '/src/assets/dosaljang.jpg',
        link: 'https://t.me/ehtkf'
    },
    { id: 2, title: '광고 문의', text: '입점 예정', link: '#' },
    { id: 3, title: '광고 문의', text: '입점 예정', link: '#' },
];

export const initialRecommendedRooms = [
    {
        id: 'dosaljang',
        name: '도살장',
        desc: '자유홍보방',
        members: 2800,
        image: '/src/assets/dosaljang.jpg',
        link: 'https://t.me/ehtkf',
        isPinned: false
    }
];

export const initialRightBanners = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    title: '배너 문의',
    text: '입점 예정',
    link: '#',
    image: null
}));

import { indexedDBStorage } from './indexedDBStorage';

class SiteConfigStore {
    constructor() {
        this.banners = [...initialBanners];
        this.recommendedRooms = [...initialRecommendedRooms];
        this.rightBanners = [...initialRightBanners];
        this.listeners = [];
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            await indexedDBStorage.init();
            const banners = await indexedDBStorage.getItem('banners');
            const rooms = await indexedDBStorage.getItem('recommendedRooms');
            const rightBanners = await indexedDBStorage.getItem('rightBanners');

            if (banners) this.banners = banners;
            if (rooms) this.recommendedRooms = rooms;
            if (rightBanners) this.rightBanners = rightBanners;

            this.initialized = true;
            this.notify();
        } catch (e) {
            console.error('Failed to load config from IndexedDB', e);
            this.initialized = true;
        }
    }

    async save(key, val) {
        try {
            await indexedDBStorage.setItem(key, val);
            console.log(`✅ Saved ${key} to IndexedDB`);
        } catch (e) {
            console.error('Failed to save config to IndexedDB', e);
            throw e;
        }
    }

    getBanners() {
        return this.banners;
    }

    getRecommendedRooms() {
        return this.recommendedRooms;
    }

    getRightBanners() {
        return this.rightBanners;
    }

    addBanner(banner) {
        this.banners.push(banner);
        this.save('banners', this.banners);
    }

    async updateBanners(newBanners) {
        this.banners = newBanners;
        await this.save('banners', this.banners);
        this.notify();
    }

    async updateRecommendedRooms(newRooms) {
        this.recommendedRooms = newRooms;
        await this.save('recommendedRooms', this.recommendedRooms);
        this.notify();
    }

    async updateRightBanners(newBanners) {
        this.rightBanners = newBanners;
        await this.save('rightBanners', this.rightBanners);
        this.notify();
    }

    moveItem(type, fromIndex, toIndex) {
        let list;
        if (type === 'banners') list = [...this.banners];
        else if (type === 'recommendedRooms') list = [...this.recommendedRooms];
        else if (type === 'rightBanners') list = [...this.rightBanners];

        if (!list) return;

        if (toIndex < 0 || toIndex >= list.length) return;

        const item = list[fromIndex];
        list.splice(fromIndex, 1);
        list.splice(toIndex, 0, item);

        if (type === 'banners') this.updateBanners(list);
        else if (type === 'recommendedRooms') this.updateRecommendedRooms(list);
        else if (type === 'rightBanners') this.updateRightBanners(list);
    }

    // Reset to factory defaults
    reset() {
        this.updateBanners(initialBanners);
        this.updateRecommendedRooms(initialRecommendedRooms);
        this.updateRightBanners(initialRightBanners);
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(l => l());
    }
}

export const siteConfigStore = new SiteConfigStore();
