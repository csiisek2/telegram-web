import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = () => {
    return (
        <Helmet>
            <title>텔레그램 홍보방 - 텔레웹</title>
            <meta name="description" content="텔레그램 홍보방, 주식, 코인, 부동산, 의료, 패션 등 다양한 텔레그램 채널과 그룹을 한눈에 확인하세요. 효과적인 텔레그램 마케팅과 커뮤니티 입장을 도와드립니다." />
            <meta name="keywords" content="텔레그램, 홍보방, 텔레그램채널, 텔레그램그룹, 주식방, 코인방, 마케팅" />
            <meta property="og:title" content="텔레그램 홍보방 - 텔레웹" />
            <meta property="og:description" content="텔레그램 홍보방, 주식, 코인, 부동산 등 다양한 텔레그램 채널과 그룹을 만나보세요." />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="텔레웹" />
        </Helmet>
    );
};

export default SEO;
