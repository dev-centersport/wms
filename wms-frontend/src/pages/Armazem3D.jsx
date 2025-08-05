import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Text, Html, PerspectiveCamera } from '@react-three/drei';
import Layout from '../components/Layout';

// Configurações para visão por cima - 2 colunas retangulares
const LARGURA_RETANGULO = 0.8; // Muito menor - reduzido drasticamente
const ALTURA_RETANGULO = 0.3; // Baixo para visão por cima
const ESPACO_ENTRE_RETANGULOS = 0.5; // Reduzido também
const NUMERO_COLUNAS = 2; // 2 colunas
const NUMERO_LINHAS = 8; // 8 linhas = 16 retângulos em formato retangular

function Retangulo({ index, aberto, setAberto }) {
  const linha = Math.floor(index / NUMERO_COLUNAS);
  const coluna = index % NUMERO_COLUNAS;
  
  const x = (coluna - (NUMERO_COLUNAS - 1) / 2) * (LARGURA_RETANGULO + ESPACO_ENTRE_RETANGULOS);
  const z = (linha - (NUMERO_LINHAS - 1) / 2) * (LARGURA_RETANGULO + ESPACO_ENTRE_RETANGULOS);

  return (
    <group position={[x, 0, z]}>
      {/* Retângulo principal - visível por cima */}
      <mesh onClick={() => setAberto(!aberto)}>
        <boxGeometry args={[LARGURA_RETANGULO, ALTURA_RETANGULO, LARGURA_RETANGULO]} />
        <meshStandardMaterial 
          color={aberto ? '#3498db' : '#34495e'} 
          opacity={0.9} 
          transparent 
        />
      </mesh>

      {/* Conteúdo quando aberto - visível por cima */}
      {aberto && (
        <group position={[0, ALTURA_RETANGULO / 2 + 0.1, 0]}>
          {/* Produtos simples */}
          <mesh position={[-0.4, 0, -0.4]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial color="#e74c3c" />
          </mesh>
          <mesh position={[0.4, 0, -0.4]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial color="#2ecc71" />
          </mesh>
          <mesh position={[-0.4, 0, 0.4]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial color="#f39c12" />
          </mesh>
          <mesh position={[0.4, 0, 0.4]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial color="#9b59b6" />
          </mesh>
        </group>
      )}

      {/* Letra do retângulo - visível por cima */}
      <Text
        position={[0, ALTURA_RETANGULO / 2 + 0.05, 0]}
        fontSize={0.2}
        color="#fff"
        anchorX="center"
        anchorY="middle"
      >
        {String.fromCharCode(65 + index)} {/* A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P */}
      </Text>

      {/* Status - visível por cima */}
      <Html position={[0, ALTURA_RETANGULO / 2 + 0.2, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{ 
          color: '#fff', 
          fontSize: 8, 
          background: aberto ? 'rgba(46, 204, 113, 0.9)' : 'rgba(231, 76, 60, 0.9)', 
          borderRadius: 2, 
          padding: '1px 4px',
          fontWeight: 'bold'
        }}>
          {aberto ? 'ABERTO' : 'FECHADO'}
        </div>
      </Html>
    </group>
  );
}

function Armazem3DScene() {
  const [retangulosAbertos, setRetangulosAbertos] = useState({});
  
  const toggleRetangulo = (index) => {
    setRetangulosAbertos(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  return (
    <>
      {/* Iluminação para visão por cima */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[0, 10, 0]} intensity={0.6} />
      
      {/* Grid de referência */}
      <Grid args={[15, 20]} cellColor="#bdc3c7" sectionColor="#95a5a6" />
      
      {/* 16 Retângulos em grade 2x8 (retangular) */}
      {Array.from({ length: 16 }).map((_, index) => (
        <Retangulo
          key={index}
          index={index}
          aberto={retangulosAbertos[index] || false}
          setAberto={() => toggleRetangulo(index)}
        />
      ))}

      {/* Labels da grade */}
      <Text
        position={[0, -8, 0]}
        fontSize={0.3}
        color="#2c3e50"
        anchorX="center"
        anchorY="middle"
      >
        Grade 2x8 - 16 Retângulos (A-P)
      </Text>
    </>
  );
}

export default function Armazem3D() {
  return (
    <Layout show={false}>
      <div style={{ 
        width: '100%', 
        height: 'calc(100vh - 120px)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          background: 'rgba(255,255,255,0.95)',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '18px' }}>
            📦 Visão por Cima - 16 Retângulos (2x8)
          </h3>
          <p style={{ margin: '0', fontSize: '14px', color: '#7f8c8d' }}>
            Clique nos retângulos para abrir/fechar
          </p>
        </div>
        
        <Canvas
          shadows
          camera={{ position: [0, 15, 0], fov: 45 }}
          style={{ background: 'transparent' }}
        >
          <PerspectiveCamera makeDefault position={[0, 15, 0]} />
          <Armazem3DScene />
          <OrbitControls 
            enablePan 
            enableZoom 
            enableRotate 
            minDistance={10} 
            maxDistance={30} 
            maxPolarAngle={Math.PI / 2.5} 
            minPolarAngle={Math.PI / 3}
          />
        </Canvas>
      </div>
    </Layout>
  );
}
