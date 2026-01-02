import React, { useEffect } from 'react';
import Board from '../components/Board';

const FreeBoardPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div style={{ marginTop: '20px' }}>
            <Board boardTitle="자유게시판" boardCategory="자유" preview={false} writeUrl="/free/write" />
        </div>
    );
};

export default FreeBoardPage;
