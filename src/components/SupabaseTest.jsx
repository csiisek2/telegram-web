import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { migrateAllData } from '../data/migrate';

const SupabaseTest = () => {
    const [status, setStatus] = useState('연결 테스트 중...');
    const [tables, setTables] = useState([]);
    const [migrating, setMigrating] = useState(false);
    const [migrationResult, setMigrationResult] = useState(null);

    useEffect(() => {
        const testConnection = async () => {
            try {
                // 간단한 연결 테스트 - posts 테이블 조회
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .limit(1);

                if (error) {
                    if (error.message.includes('relation "public.posts" does not exist')) {
                        setStatus('❗ 데이터베이스 연결 성공! 하지만 테이블이 아직 생성되지 않았습니다.');
                    } else {
                        setStatus(`❌ 에러: ${error.message}`);
                    }
                } else {
                    setStatus('✅ Supabase 연결 성공!');
                    setTables(['posts', 'users', 'channels', 'site_config']);
                }
            } catch (err) {
                setStatus(`❌ 연결 실패: ${err.message}`);
            }
        };

        testConnection();
    }, []);

    const handleMigration = async () => {
        setMigrating(true);
        setMigrationResult(null);
        setStatus('🔄 데이터 마이그레이션 중...');

        const result = await migrateAllData();

        setMigrating(false);
        setMigrationResult(result);

        if (result.channels.success && result.siteConfig.success) {
            setStatus('✅ 데이터 마이그레이션 완료!');
        } else {
            setStatus('⚠️ 마이그레이션 일부 실패');
        }
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '15px 20px',
            backgroundColor: '#fff',
            border: '2px solid #2481CC',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10000,
            maxWidth: '400px'
        }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#2481CC' }}>
                🔌 Supabase 연결 상태
            </h4>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>{status}</p>
            {tables.length > 0 && (
                <div style={{ marginTop: '10px', fontSize: '13px', color: '#666' }}>
                    <strong>테이블:</strong> {tables.join(', ')}
                </div>
            )}

            {tables.length > 0 && !migrationResult && (
                <button
                    onClick={handleMigration}
                    disabled={migrating}
                    style={{
                        marginTop: '10px',
                        padding: '8px 16px',
                        backgroundColor: migrating ? '#ccc' : '#2481CC',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: migrating ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        width: '100%'
                    }}
                >
                    {migrating ? '마이그레이션 중...' : '📦 데이터 마이그레이션'}
                </button>
            )}

            {migrationResult && (
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                    <div>Channels: {migrationResult.channels.success ? '✅' : '❌'} {migrationResult.channels.count || 0}개</div>
                    <div>Site Config: {migrationResult.siteConfig.success ? '✅' : '❌'} {migrationResult.siteConfig.count || 0}개</div>
                </div>
            )}
        </div>
    );
};

export default SupabaseTest;
