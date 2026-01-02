import React, { useState, useEffect } from 'react';
import {
    getBanners,
    getRooms,
    getRightBanners,
    updateAllBanners,
    updateAllRooms,
    updateAllRightBanners,
    addRoom as addRoomAPI,
    deleteRoom as deleteRoomAPI,
    deleteBanner,
    deleteRightBanner,
    convertBannersFromDB,
    convertRoomsFromDB,
    convertRightBannersFromDB
} from '../api/siteConfig';
import {
    getAllPosts,
    deletePost,
    togglePinPost
} from '../api/posts';
import {
    getAllUsers,
    deleteUserData
} from '../api/users';

const AdminPage = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Config State
    const [banners, setBanners] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [rightBanners, setRightBanners] = useState([]);

    // Posts State
    const [posts, setPosts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all'); // 'all', 'free', 'scammer'

    // Users State
    const [users, setUsers] = useState([]);

    // Selected indices for dropdown editing
    const [selectedBannerIndex, setSelectedBannerIndex] = useState(0);
    const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);
    const [selectedRightBannerIndex, setSelectedRightBannerIndex] = useState(0);

    // Modal State
    const [modal, setModal] = useState({
        isOpen: false,
        type: null,
        section: null,
        targetIndex: null
    });
    const [jumpInput, setJumpInput] = useState('');

    // Toast Notification State
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        if (isLoggedIn) {
            fetchAllData();
        }
    }, [isLoggedIn]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [bannersData, roomsData, rightBannersData, postsData, usersData] = await Promise.all([
                getBanners(),
                getRooms(),
                getRightBanners(),
                getAllPosts(),
                getAllUsers()
            ]);

            setBanners(convertBannersFromDB(bannersData));
            setRooms(convertRoomsFromDB(roomsData));
            setRightBanners(convertRightBannersFromDB(rightBannersData));
            setPosts(postsData);
            setUsers(usersData);
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            showToast('데이터 로드에 실패했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Toast notification system
    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'tmdwo8911!!') {
            setIsLoggedIn(true);
        } else {
            showToast('비밀번호가 틀렸습니다.', 'error');
        }
    };

    const closeModal = () => {
        setModal({ isOpen: false, type: null, section: null, targetIndex: null });
        setJumpInput('');
    };

    // Image compression helper
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            // If it's a video, don't compress - just convert to base64
            if (file.type.startsWith('video/')) {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = (error) => reject(new Error('비디오 파일 읽기 실패: ' + error));
                reader.readAsDataURL(file);
                return;
            }

            // For images, compress them
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        // Resize to max 400px width while maintaining aspect ratio
                        const maxWidth = 400;
                        const scaleFactor = maxWidth / img.width;
                        const width = img.width > maxWidth ? maxWidth : img.width;
                        const height = img.width > maxWidth ? img.height * scaleFactor : img.height;

                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0, width, height);

                        // Compress to 70% quality
                        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                        resolve(compressedDataUrl);
                    } catch (error) {
                        reject(new Error('이미지 압축 실패: ' + error.message));
                    }
                };
                img.onerror = () => reject(new Error('이미지 로딩 실패. 올바른 이미지 파일인지 확인하세요.'));
                img.src = e.target.result;
            };
            reader.onerror = (error) => reject(new Error('파일 읽기 실패: ' + error));
            reader.readAsDataURL(file);
        });
    };

    const openDeleteModal = (index) => {
        setModal({
            isOpen: true,
            type: 'delete',
            section: 'recommendedRooms',
            targetIndex: index
        });
    };

    const openJumpModal = (section, index) => {
        setModal({
            isOpen: true,
            type: 'jump',
            section: section,
            targetIndex: index
        });
        setJumpInput('');
    };

    const confirmModal = async () => {
        const { type, section, targetIndex } = modal;

        if (type === 'delete') {
            try {
                const roomToDelete = rooms[targetIndex];
                await deleteRoomAPI(roomToDelete.id);
                const newRooms = rooms.filter((_, i) => i !== targetIndex);
                setRooms(newRooms);
                closeModal();
                showToast('삭제되었습니다!');
            } catch (error) {
                console.error('삭제 실패:', error);
                showToast('삭제에 실패했습니다.', 'error');
            }
        } else if (type === 'jump') {
            const list = section === 'banners' ? banners : section === 'recommendedRooms' ? rooms : rightBanners;
            const targetNum = parseInt(jumpInput, 10);

            if (isNaN(targetNum) || targetNum < 1 || targetNum > list.length) {
                showToast(`1부터 ${list.length} 사이의 숫자를 입력해주세요.`, 'error');
                return;
            }

            const newTargetIndex = targetNum - 1;
            if (newTargetIndex !== targetIndex) {
                const newList = [...list];
                const [item] = newList.splice(targetIndex, 1);
                newList.splice(newTargetIndex, 0, item);

                if (section === 'banners') setBanners(newList);
                else if (section === 'recommendedRooms') setRooms(newList);
                else setRightBanners(newList);

                closeModal();
                showToast('순서가 변경되었습니다! 저장 버튼을 눌러주세요.');
            } else {
                closeModal();
            }
        }
    };

    const handleMove = (type, index, direction) => {
        const list = type === 'banners' ? banners : type === 'recommendedRooms' ? rooms : rightBanners;
        const newList = [...list];

        if (direction === 'up' && index > 0) {
            [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
        } else if (direction === 'down' && index < list.length - 1) {
            [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
        } else {
            return;
        }

        if (type === 'banners') setBanners(newList);
        else if (type === 'recommendedRooms') setRooms(newList);
        else setRightBanners(newList);

        showToast('순서가 변경되었습니다! 저장 버튼을 눌러주세요.');
    };

    const handleBannerChange = (index, field, value) => {
        const newBanners = [...banners];
        newBanners[index] = { ...newBanners[index], [field]: value };
        setBanners(newBanners);
    };

    const handleBannerSave = async () => {
        setLoading(true);
        try {
            await updateAllBanners(banners);
            showToast('배너 설정이 저장되었습니다!');
            await fetchAllData();
        } catch (error) {
            console.error('저장 실패:', error);
            showToast('저장 실패: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleBannerImageUpload = async (index, e) => {
        const file = e.target.files[0];
        if (!file) return;

        console.log('배너 업로드:', file.name, file.type, file.size);

        try {
            const compressedImage = await compressImage(file);
            console.log('배너 압축 완료, 원본:', file.size, '압축 후:', compressedImage.length);
            handleBannerChange(index, 'image', compressedImage);
            showToast('이미지가 업로드되었습니다! "배너 설정 저장" 버튼을 눌러 저장하세요.');
        } catch (error) {
            console.error('배너 압축 실패:', error);
            showToast('이미지 업로드에 실패했습니다.', 'error');
        }
    };

    const handleRoomChange = (index, field, value) => {
        const newRooms = [...rooms];
        newRooms[index] = { ...newRooms[index], [field]: value };
        setRooms(newRooms);
    };

    const handleRoomImageUpload = async (index, e) => {
        const file = e.target.files[0];
        if (!file) {
            console.log('파일 선택 취소');
            return;
        }

        // File size check (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            showToast('파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.', 'error');
            e.target.value = '';
            return;
        }

        console.log('홍보방 업로드 시작:', file.name, file.type, file.size);

        try {
            const compressedImage = await compressImage(file);
            console.log('홍보방 압축 완료, 원본:', file.size, '압축 후:', compressedImage.length);
            handleRoomChange(index, 'image', compressedImage);
            showToast('✅ 이미지가 업로드되었습니다! 반드시 "추천 홍보방 저장" 버튼을 눌러 저장하세요.');
        } catch (error) {
            console.error('홍보방 압축 실패:', error);
            showToast(`이미지 업로드 실패: ${error.message}`, 'error');
            e.target.value = '';
        }
    };

    const addRoom = async () => {
        setLoading(true);
        try {
            const newRoomData = {
                name: '새 홍보방',
                desc: '설명 입력',
                members: 0,
                link: '#',
                image: '',
                isPinned: false,
                display_order: 0
            };
            await addRoomAPI(newRoomData);
            await fetchAllData();
            showToast('새 홍보방이 추가되었습니다!');
        } catch (error) {
            console.error('추가 실패:', error);
            showToast('추가에 실패했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const togglePin = (index) => {
        const newRooms = [...rooms];
        const currentPinState = newRooms[index].isPinned;

        // If pinning this item, unpin all others first
        if (!currentPinState) {
            newRooms.forEach(room => room.isPinned = false);
        }

        newRooms[index].isPinned = !currentPinState;

        // Sort: pinned items first
        newRooms.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return 0;
        });

        setRooms(newRooms);
        showToast(currentPinState ? '고정이 해제되었습니다!' : '1번 위치에 고정되었습니다!');
    };

    const handleRoomSave = async () => {
        setLoading(true);
        try {
            console.log('저장 시도:', rooms.length, '개 항목');
            await updateAllRooms(rooms);
            console.log('저장 성공!');
            showToast('추천 홍보방 설정이 저장되었습니다!');
            await fetchAllData();
        } catch (error) {
            console.error('저장 실패:', error);
            showToast('저장 실패: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleBackup = () => {
        const backupData = {
            banners: banners,
            recommendedRooms: rooms,
            rightBanners: rightBanners,
            backupDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);

        showToast('백업 파일이 다운로드되었습니다!');
    };

    const handleRestore = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const backupData = JSON.parse(event.target.result);

                if (backupData.banners) {
                    setBanners(backupData.banners);
                    await siteConfigStore.updateBanners(backupData.banners);
                }
                if (backupData.recommendedRooms) {
                    setRooms(backupData.recommendedRooms);
                    await siteConfigStore.updateRecommendedRooms(backupData.recommendedRooms);
                }
                if (backupData.rightBanners) {
                    setRightBanners(backupData.rightBanners);
                    await siteConfigStore.updateRightBanners(backupData.rightBanners);
                }

                showToast('백업 데이터가 복원되었습니다!');
            } catch (error) {
                console.error('복원 실패:', error);
                showToast('백업 파일이 올바르지 않습니다.', 'error');
            }
        };
        reader.readAsText(file);

        // Reset the input so the same file can be selected again
        e.target.value = '';
    };

    const handleFactoryReset = () => {
        if (window.confirm('⚠️ 모든 설정을 초기화하시겠습니까? (되돌릴 수 없습니다)')) {
            siteConfigStore.reset();
            showToast('초기화되었습니다.');
        }
    };

    if (!isLoggedIn) {
        return (
            <div style={styles.loginContainer}>
                <div style={styles.loginBox}>
                    <h2 style={{ marginBottom: '20px' }}>관리자 로그인</h2>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                        />
                        <button type="submit" style={styles.button}>로그인</button>
                    </form>
                </div>
                {/* Toast notifications */}
                <div style={styles.toastContainer}>
                    {toasts.map(toast => (
                        <div key={toast.id} style={{ ...styles.toast, ...(toast.type === 'error' ? styles.toastError : styles.toastSuccess) }}>
                            {toast.message}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '40px 20px', position: 'relative' }}>
            {/* Toast notifications */}
            <div style={styles.toastContainer}>
                {toasts.map(toast => (
                    <div key={toast.id} style={{ ...styles.toast, ...(toast.type === 'error' ? styles.toastError : styles.toastSuccess) }}>
                        {toast.message}
                    </div>
                ))}
            </div>

            <div style={styles.header}>
                <h1>관리자 페이지</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleBackup} style={styles.backupBtn}>💾 백업 (다운로드)</button>
                    <label style={styles.restoreBtn}>
                        📤 복원 (업로드)
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleRestore}
                            style={{ display: 'none' }}
                        />
                    </label>
                    <button onClick={handleFactoryReset} style={styles.resetBtn}>초기화 (Factory Reset)</button>
                </div>
            </div>

            {modal.isOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h3 style={styles.modalHeader}>
                            {modal.type === 'delete' ? '🗑️ 삭제 확인' : '🔢 순서 변경'}
                        </h3>
                        <div style={styles.modalBody}>
                            {modal.type === 'delete' ? (
                                <p>정말 삭제하시겠습니까?</p>
                            ) : (
                                <div>
                                    <p>이동할 순서(번호)를 입력하세요:</p>
                                    <input
                                        type="number"
                                        value={jumpInput}
                                        onChange={(e) => setJumpInput(e.target.value)}
                                        style={styles.modalInput}
                                        autoFocus
                                        placeholder="1"
                                    />
                                </div>
                            )}
                        </div>
                        <div style={styles.modalFooter}>
                            <button onClick={closeModal} style={styles.cancelBtn}>취소</button>
                            <button onClick={confirmModal} style={styles.confirmBtn}>
                                {modal.type === 'delete' ? '삭제' : '이동'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <section style={styles.section}>
                <h2>1. 메인 배너 설정</h2>

                <div style={{ marginBottom: '20px' }}>
                    <label style={styles.label}>배너 선택:</label>
                    <select
                        value={selectedBannerIndex}
                        onChange={(e) => setSelectedBannerIndex(Number(e.target.value))}
                        style={styles.select}
                    >
                        {banners.map((banner, index) => (
                            <option key={banner.id} value={index}>
                                배너 #{index + 1} {index === 0 ? '(왼쪽 상단)' : `(왼쪽 사이드바 ${index}번)`}
                            </option>
                        ))}
                    </select>
                </div>

                {banners[selectedBannerIndex] && (
                    <div style={styles.editCard}>
                        <div style={styles.cardHeader}>
                            <h3 style={styles.cardTitle}>배너 #{selectedBannerIndex + 1} 편집</h3>
                            <div style={styles.moveBtns}>
                                <button
                                    onClick={() => handleMove('banners', selectedBannerIndex, 'up')}
                                    disabled={selectedBannerIndex === 0}
                                    style={styles.moveBtn}
                                >
                                    ▲
                                </button>
                                <button
                                    onClick={() => handleMove('banners', selectedBannerIndex, 'down')}
                                    disabled={selectedBannerIndex === banners.length - 1}
                                    style={styles.moveBtn}
                                >
                                    ▼
                                </button>
                                <button
                                    onClick={() => openModal('jump', 'banners', selectedBannerIndex)}
                                    style={styles.moveBtn}
                                    title="특정 위치로 이동"
                                >
                                    🔢
                                </button>
                                <button
                                    onClick={async () => {
                                        if (window.confirm('정말 삭제하시겠습니까?')) {
                                            try {
                                                await deleteBanner(banners[selectedBannerIndex].id);
                                                await fetchAllData();
                                                setSelectedBannerIndex(Math.max(0, selectedBannerIndex - 1));
                                                showToast('배너가 삭제되었습니다!');
                                            } catch (error) {
                                                console.error('삭제 실패:', error);
                                                showToast('삭제에 실패했습니다.', 'error');
                                            }
                                        }
                                    }}
                                    style={{ ...styles.moveBtn, backgroundColor: '#e74c3c', color: '#fff' }}
                                    title="삭제"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>

                        <label style={styles.label}>제목:</label>
                        <input
                            type="text"
                            value={banners[selectedBannerIndex].title}
                            onChange={(e) => handleBannerChange(selectedBannerIndex, 'title', e.target.value)}
                            style={styles.input}
                        />

                        <label style={styles.label}>설명:</label>
                        <input
                            type="text"
                            value={banners[selectedBannerIndex].text}
                            onChange={(e) => handleBannerChange(selectedBannerIndex, 'text', e.target.value)}
                            style={styles.input}
                        />

                        <label style={styles.label}>링크:</label>
                        <input
                            type="text"
                            value={banners[selectedBannerIndex].link}
                            onChange={(e) => handleBannerChange(selectedBannerIndex, 'link', e.target.value)}
                            style={styles.input}
                            placeholder="#"
                        />

                        <label style={styles.label}>이미지/동영상:</label>
                        <input
                            type="file"
                            accept="image/*,video/mp4"
                            onChange={(e) => handleBannerImageUpload(selectedBannerIndex, e)}
                            style={styles.fileInput}
                            key={`banner-${banners[selectedBannerIndex].id}`}
                        />

                        <div style={styles.preview}>
                            {banners[selectedBannerIndex].image ? (
                                banners[selectedBannerIndex].image.startsWith('data:video') ?
                                    <video src={banners[selectedBannerIndex].image} autoPlay loop muted playsInline style={{ maxWidth: '100%', maxHeight: '150px' }} /> :
                                    <img src={banners[selectedBannerIndex].image} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px' }} />
                            ) : <div style={{ color: '#aaa', padding: '20px', textAlign: 'center' }}>이미지 없음</div>}
                        </div>
                    </div>
                )}

                <button onClick={handleBannerSave} style={styles.saveBtn}>배너 설정 저장</button>
            </section>

            <section style={styles.section}>
                <h2>2. 추천 홍보방 관리 (가운데 그리드)</h2>
                <button onClick={addRoom} style={styles.addBtn}>+ 새 홍보방 추가</button>
                <div style={styles.list}>
                    {rooms.map((room, index) => (
                        <div key={room.id} style={styles.listItem}>
                            <div style={styles.moveBtnsColumn}>
                                <button onClick={() => handleMove('recommendedRooms', index, 'up')} disabled={index === 0} style={styles.moveBtnSmall}>▲</button>
                                <button onClick={() => handleMove('recommendedRooms', index, 'down')} disabled={index === rooms.length - 1} style={styles.moveBtnSmall}>▼</button>
                                <button type="button" onClick={() => openJumpModal('recommendedRooms', index)} style={{ ...styles.moveBtnSmall, marginTop: '4px', backgroundColor: '#ecf0f1', color: '#333' }} title="순서 직접 입력">🔢</button>
                            </div>
                            <div style={styles.previewSmall}>
                                {room.image ? (
                                    room.image.startsWith('data:video') ?
                                        <video src={room.image} autoPlay loop muted playsInline style={{ width: '50px', height: '50px', objectFit: 'cover' }} /> :
                                        <img src={room.image} alt="Preview" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                ) : <div style={{ width: '50px', height: '50px', background: '#eee' }}></div>}
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <input type="text" value={room.name} onChange={(e) => handleRoomChange(index, 'name', e.target.value)} placeholder="방 이름" style={styles.inputSmall} />
                                <input type="text" value={room.desc} onChange={(e) => handleRoomChange(index, 'desc', e.target.value)} placeholder="설명" style={styles.inputSmall} />
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <input type="number" value={room.members} onChange={(e) => handleRoomChange(index, 'members', Number(e.target.value))} placeholder="인원수" style={styles.inputSmall} />
                                <input type="text" value={room.link} onChange={(e) => handleRoomChange(index, 'link', e.target.value)} placeholder="링크" style={styles.inputSmall} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <input
                                    type="file"
                                    accept="image/*,video/mp4"
                                    onChange={(e) => handleRoomImageUpload(index, e)}
                                    style={{ fontSize: '11px' }}
                                    key={`room-upload-${room.id}`}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => togglePin(index)}
                                style={{
                                    ...styles.pinBtn,
                                    backgroundColor: room.isPinned ? '#f39c12' : '#95a5a6'
                                }}
                                title={room.isPinned ? '고정 해제' : '상단에 고정'}
                            >
                                {room.isPinned ? '📌 고정됨' : '📌 고정'}
                            </button>
                            <button type="button" onClick={() => openDeleteModal(index)} style={styles.deleteBtn}>삭제</button>
                        </div>
                    ))}
                </div>
                <button onClick={handleRoomSave} style={styles.saveBtn}>추천 홍보방 저장</button>
            </section>

            <section style={styles.section}>
                <h2>3. 우측 사이드바 (스페셜 업소) 관리</h2>

                <div style={{ marginBottom: '20px' }}>
                    <label style={styles.label}>우측 배너 선택:</label>
                    <select
                        value={selectedRightBannerIndex}
                        onChange={(e) => setSelectedRightBannerIndex(Number(e.target.value))}
                        style={styles.select}
                    >
                        {rightBanners.map((banner, index) => (
                            <option key={banner.id} value={index}>
                                우측 배너 #{index + 1} (스페셜 업소)
                            </option>
                        ))}
                    </select>
                </div>

                {rightBanners[selectedRightBannerIndex] && (
                    <div style={styles.editCard}>
                        <div style={styles.cardHeader}>
                            <h3 style={styles.cardTitle}>우측 배너 #{selectedRightBannerIndex + 1} 편집</h3>
                            <div style={styles.moveBtns}>
                                <button
                                    onClick={() => handleMove('rightBanners', selectedRightBannerIndex, 'up')}
                                    disabled={selectedRightBannerIndex === 0}
                                    style={styles.moveBtn}
                                >
                                    ▲
                                </button>
                                <button
                                    onClick={() => handleMove('rightBanners', selectedRightBannerIndex, 'down')}
                                    disabled={selectedRightBannerIndex === rightBanners.length - 1}
                                    style={styles.moveBtn}
                                >
                                    ▼
                                </button>
                                <button
                                    onClick={() => openModal('jump', 'rightBanners', selectedRightBannerIndex)}
                                    style={styles.moveBtn}
                                    title="특정 위치로 이동"
                                >
                                    🔢
                                </button>
                                <button
                                    onClick={async () => {
                                        if (window.confirm('정말 삭제하시겠습니까?')) {
                                            try {
                                                await deleteRightBanner(rightBanners[selectedRightBannerIndex].id);
                                                await fetchAllData();
                                                setSelectedRightBannerIndex(Math.max(0, selectedRightBannerIndex - 1));
                                                showToast('우측 배너가 삭제되었습니다!');
                                            } catch (error) {
                                                console.error('삭제 실패:', error);
                                                showToast('삭제에 실패했습니다.', 'error');
                                            }
                                        }
                                    }}
                                    style={{ ...styles.moveBtn, backgroundColor: '#e74c3c', color: '#fff' }}
                                    title="삭제"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>

                        <label style={styles.label}>제목:</label>
                        <input
                            type="text"
                            value={rightBanners[selectedRightBannerIndex].title}
                            onChange={(e) => {
                                const newBanners = [...rightBanners];
                                newBanners[selectedRightBannerIndex].title = e.target.value;
                                setRightBanners(newBanners);
                            }}
                            style={styles.input}
                        />

                        <label style={styles.label}>설명:</label>
                        <input
                            type="text"
                            value={rightBanners[selectedRightBannerIndex].text}
                            onChange={(e) => {
                                const newBanners = [...rightBanners];
                                newBanners[selectedRightBannerIndex].text = e.target.value;
                                setRightBanners(newBanners);
                            }}
                            style={styles.input}
                        />

                        <label style={styles.label}>링크:</label>
                        <input
                            type="text"
                            value={rightBanners[selectedRightBannerIndex].link}
                            onChange={(e) => {
                                const newBanners = [...rightBanners];
                                newBanners[selectedRightBannerIndex].link = e.target.value;
                                setRightBanners(newBanners);
                            }}
                            style={styles.input}
                            placeholder="#"
                        />

                        <label style={styles.label}>이미지/동영상:</label>
                        <input
                            type="file"
                            accept="image/*,video/mp4"
                            onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                try {
                                    const compressedImage = await compressImage(file);
                                    const newBanners = [...rightBanners];
                                    newBanners[selectedRightBannerIndex].image = compressedImage;
                                    setRightBanners(newBanners);
                                    showToast('이미지가 업로드되었습니다! "우측 사이드바 저장" 버튼을 눌러 저장하세요.');
                                } catch (error) {
                                    console.error('우측 배너 압축 실패:', error);
                                    showToast('이미지 업로드에 실패했습니다.', 'error');
                                }
                            }}
                            style={styles.fileInput}
                            key={`right-${rightBanners[selectedRightBannerIndex].id}`}
                        />

                        <div style={styles.preview}>
                            {rightBanners[selectedRightBannerIndex].image ? (
                                rightBanners[selectedRightBannerIndex].image.startsWith('data:video') ?
                                    <video src={rightBanners[selectedRightBannerIndex].image} autoPlay loop muted playsInline style={{ maxWidth: '100%', maxHeight: '150px' }} /> :
                                    <img src={rightBanners[selectedRightBannerIndex].image} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px' }} />
                            ) : <div style={{ color: '#aaa', padding: '20px', textAlign: 'center' }}>이미지 없음</div>}
                        </div>
                    </div>
                )}

                <button onClick={async () => {
                    setLoading(true);
                    try {
                        await updateAllRightBanners(rightBanners);
                        showToast('우측 사이드바 설정이 저장되었습니다!');
                        await fetchAllData();
                    } catch (error) {
                        console.error('저장 실패:', error);
                        showToast('저장 실패: ' + error.message, 'error');
                    } finally {
                        setLoading(false);
                    }
                }} style={styles.saveBtn}>우측 사이드바 저장</button>
            </section>

            <section style={styles.section}>
                <h2>4. 게시판 관리</h2>

                <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setSelectedCategory('all')}
                        style={{
                            ...styles.categoryBtn,
                            ...(selectedCategory === 'all' ? styles.activeCategoryBtn : {})
                        }}
                    >
                        전체 ({posts.length})
                    </button>
                    <button
                        onClick={() => setSelectedCategory('free')}
                        style={{
                            ...styles.categoryBtn,
                            ...(selectedCategory === 'free' ? styles.activeCategoryBtn : {})
                        }}
                    >
                        자유게시판 ({posts.filter(p => p.category === 'free').length})
                    </button>
                    <button
                        onClick={() => setSelectedCategory('scammer')}
                        style={{
                            ...styles.categoryBtn,
                            ...(selectedCategory === 'scammer' ? styles.activeCategoryBtn : {})
                        }}
                    >
                        사기꾼게시판 ({posts.filter(p => p.category === 'scammer').length})
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '2px solid #ddd' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>카테고리</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>제목</th>
                                <th style={{ padding: '10px', textAlign: 'center' }}>작성자</th>
                                <th style={{ padding: '10px', textAlign: 'center' }}>작성일</th>
                                <th style={{ padding: '10px', textAlign: 'center' }}>조회</th>
                                <th style={{ padding: '10px', textAlign: 'center' }}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts
                                .filter(post => selectedCategory === 'all' || post.category === selectedCategory)
                                .map((post) => (
                                    <tr key={post.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px', textAlign: 'left' }}>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                backgroundColor: post.category === 'free' ? '#e3f2fd' : '#ffebee',
                                                color: post.category === 'free' ? '#1976d2' : '#c62828'
                                            }}>
                                                {post.category === 'free' ? '자유' : '사기꾼'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'left' }}>
                                            {post.pinned && <span style={{ color: '#f39c12', marginRight: '4px' }}>📌</span>}
                                            {post.title}
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>{post.author}</td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>{post.views}</td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await togglePinPost(post.id, !post.pinned);
                                                            await fetchAllData();
                                                            showToast(post.pinned ? '고정 해제되었습니다!' : '고정되었습니다!');
                                                        } catch (error) {
                                                            console.error('고정 실패:', error);
                                                            showToast('고정 처리에 실패했습니다.', 'error');
                                                        }
                                                    }}
                                                    style={{
                                                        ...styles.actionBtn,
                                                        backgroundColor: post.pinned ? '#f39c12' : '#95a5a6'
                                                    }}
                                                    title={post.pinned ? '고정 해제' : '상단 고정'}
                                                >
                                                    📌
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm('정말 삭제하시겠습니까?')) {
                                                            try {
                                                                await deletePost(post.id);
                                                                await fetchAllData();
                                                                showToast('게시글이 삭제되었습니다!');
                                                            } catch (error) {
                                                                console.error('삭제 실패:', error);
                                                                showToast('삭제에 실패했습니다.', 'error');
                                                            }
                                                        }
                                                    }}
                                                    style={styles.actionBtn}
                                                    title="삭제"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>

                    {posts.filter(post => selectedCategory === 'all' || post.category === selectedCategory).length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                            게시글이 없습니다.
                        </div>
                    )}
                </div>
            </section>

            <section style={styles.section}>
                <h2>5. 회원 관리</h2>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '2px solid #ddd' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>닉네임</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>이메일</th>
                                <th style={{ padding: '10px', textAlign: 'center' }}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>{user.nickname}</td>
                                    <td style={{ padding: '10px' }}>{user.email}</td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(`${user.nickname} 회원을 정말 탈퇴시키겠습니까?\n\n이 회원이 등록한 모든 채널이 삭제됩니다.`)) {
                                                    try {
                                                        await deleteUserData(user.id);
                                                        await fetchAllData();
                                                        showToast('회원이 탈퇴 처리되었습니다!');
                                                    } catch (error) {
                                                        console.error('회원 삭제 실패:', error);
                                                        showToast('회원 삭제에 실패했습니다.', 'error');
                                                    }
                                                }
                                            }}
                                            style={{
                                                ...styles.actionBtn,
                                                backgroundColor: '#e74c3c',
                                                color: '#fff'
                                            }}
                                            title="회원 탈퇴"
                                        >
                                            탈퇴
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {users.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                            등록된 회원이 없습니다.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

const styles = {
    loginContainer: { height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    loginBox: { padding: '40px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '10px' },
    section: { marginBottom: '50px', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eee' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' },
    card: { border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: '#f9f9f9' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #ddd', paddingBottom: '5px' },
    cardTitle: { fontSize: '16px', fontWeight: 'bold' },
    moveBtns: { display: 'flex', gap: '4px' },
    moveBtn: { padding: '2px 8px', fontSize: '12px', cursor: 'pointer' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px', marginTop: '10px' },
    input: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' },
    select: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', backgroundColor: '#fff', cursor: 'pointer' },
    editCard: { border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9', marginBottom: '20px' },
    fileInput: { marginTop: '5px', fontSize: '13px' },
    preview: { marginTop: '10px', height: '100px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', overflow: 'hidden' },
    saveBtn: { backgroundColor: 'var(--tg-primary)', color: '#fff', padding: '12px 24px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold', display: 'block', width: '100%' },
    addBtn: { backgroundColor: '#2ecc71', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '15px', fontWeight: 'bold' },
    list: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' },
    listItem: { display: 'flex', gap: '15px', alignItems: 'center', border: '1px solid #eee', padding: '10px', borderRadius: '8px', backgroundColor: '#fafafa' },
    moveBtnsColumn: { display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '8px' },
    moveBtnSmall: { padding: '2px 6px', fontSize: '10px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ddd' },
    previewSmall: { width: '50px', height: '50px', overflow: 'hidden', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee' },
    inputSmall: { width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' },
    deleteBtn: { backgroundColor: '#e74c3c', color: '#fff', padding: '6px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    pinBtn: { backgroundColor: '#95a5a6', color: '#fff', padding: '6px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
    backupBtn: { backgroundColor: '#3498db', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
    restoreBtn: { backgroundColor: '#2ecc71', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', display: 'inline-block' },
    resetBtn: { backgroundColor: '#e74c3c', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
    button: { backgroundColor: '#333', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginTop: '10px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '300px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', textAlign: 'center' },
    modalHeader: { marginTop: 0, marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' },
    modalBody: { marginBottom: '20px' },
    modalInput: { width: '80%', padding: '8px', fontSize: '16px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px', marginTop: '10px' },
    modalFooter: { display: 'flex', justifyContent: 'center', gap: '10px' },
    confirmBtn: { backgroundColor: '#e74c3c', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    cancelBtn: { backgroundColor: '#95a5a6', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' },

    // Toast Notification Styles
    toastContainer: {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    toast: {
        padding: '12px 20px',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontSize: '14px',
        fontWeight: '500',
        minWidth: '250px',
        animation: 'slideIn 0.3s ease-out',
    },
    toastSuccess: {
        backgroundColor: '#2ecc71',
        color: '#fff',
    },
    toastError: {
        backgroundColor: '#e74c3c',
        color: '#fff',
    },
    categoryBtn: {
        padding: '8px 16px',
        border: '1px solid #ddd',
        backgroundColor: '#fff',
        cursor: 'pointer',
        borderRadius: '4px',
        fontSize: '13px',
        fontWeight: '500',
    },
    activeCategoryBtn: {
        backgroundColor: 'var(--tg-primary)',
        color: '#fff',
        borderColor: 'var(--tg-primary)',
        fontWeight: 'bold',
    },
    actionBtn: {
        padding: '4px 8px',
        border: 'none',
        backgroundColor: '#e74c3c',
        color: '#fff',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
    },
};

export default AdminPage;
