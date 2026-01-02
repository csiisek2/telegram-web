
import React from 'react';
import Board from '../components/Board';

const ScammerBoardPage = () => {
    return (
        <div style={{ marginTop: '20px' }}>
            <Board boardTitle="사기꾼 게시판" boardCategory="사기" preview={false} writeUrl="/scammer/write" />
        </div>
    );
};

export default ScammerBoardPage;
