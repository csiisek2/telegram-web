import { indexedDBStorage } from './indexedDBStorage';

class UserStorage {
    constructor() {
        this.dbName = 'userDB';
        this.storeName = 'users';
        this.init();
    }

    async init() {
        // IndexedDB 초기화는 indexedDBStorage에서 처리
        await indexedDBStorage.init();
    }

    // 비밀번호 해싱 (간단한 해싱 - 실제로는 bcrypt 등 사용)
    hashPassword(password) {
        // 실제 프로덕션에서는 bcrypt 등을 사용해야 하지만
        // 클라이언트 측이므로 간단한 해싱 사용
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    // 모든 사용자 가져오기
    async getAllUsers() {
        try {
            const users = await indexedDBStorage.getItem('users');
            return users || [];
        } catch (error) {
            console.error('Failed to get users:', error);
            return [];
        }
    }

    // 사용자 저장
    async saveUsers(users) {
        try {
            await indexedDBStorage.setItem('users', users);
        } catch (error) {
            console.error('Failed to save users:', error);
            throw error;
        }
    }

    // 아이디 중복 체크
    async checkIdExists(id) {
        const users = await this.getAllUsers();
        return users.some(user => user.id === id);
    }

    // 회원가입
    async register(userData) {
        const { id, password, nickname, telegramId } = userData;

        // 유효성 검사
        if (!id || !password || !nickname || !telegramId) {
            throw new Error('모든 필드를 입력해주세요.');
        }

        // 텔레그램 ID 형식 체크
        if (!telegramId.startsWith('@')) {
            throw new Error('텔레그램 아이디는 @로 시작해야 합니다.');
        }

        // 아이디 중복 체크
        const exists = await this.checkIdExists(id);
        if (exists) {
            throw new Error('이미 사용중인 아이디입니다.');
        }

        // 새 사용자 생성
        const newUser = {
            id,
            password: this.hashPassword(password),
            nickname,
            telegramId,
            createdAt: new Date().toISOString()
        };

        // 저장
        const users = await this.getAllUsers();
        users.push(newUser);
        await this.saveUsers(users);

        return { id, nickname, telegramId };
    }

    // 로그인
    async login(id, password) {
        const users = await this.getAllUsers();
        const hashedPassword = this.hashPassword(password);

        const user = users.find(u => u.id === id && u.password === hashedPassword);

        if (!user) {
            throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
        }

        // 비밀번호 제외하고 반환
        return {
            id: user.id,
            nickname: user.nickname,
            telegramId: user.telegramId
        };
    }

    // 텔레그램 ID로 사용자 찾기 (아이디/비번 찾기용)
    async findByTelegramId(telegramId) {
        const users = await this.getAllUsers();
        return users.find(u => u.telegramId === telegramId);
    }
}

export const userStorage = new UserStorage();
