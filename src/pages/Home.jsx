
import React from 'react';
import MainBanner from '../components/MainBanner';
import AdTextSection from '../components/AdTextSection';
import Board from '../components/Board';

const Home = () => {
    return (
        <>
            <div id="home">
                <MainBanner />
                <AdTextSection />
            </div>
            {/*
        In Home page, we show boards in "preview" mode (implied by default or explicit prop later).
        I'll pass a 'preview' prop which I will implement in Board.jsx next.
      */}
            <Board id="free-board" boardTitle="자유게시판" boardCategory="자유" preview={true} linkUrl="/free" />
            <Board id="scammer-board" boardTitle="사기꾼 게시판" boardCategory="사기" preview={true} linkUrl="/scammer" />
        </>
    );
};

export default Home;
