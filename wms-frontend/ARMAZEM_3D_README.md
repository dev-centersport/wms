# 🏭 Visualização 3D do Armazém

## Descrição

Esta funcionalidade oferece uma visualização tridimensional interativa do armazém, permitindo aos usuários explorar as localizações, prateleiras e produtos de forma imersiva usando Three.js.

## Funcionalidades

### 🎯 Características Principais

- **Visualização 3D Realista**: Modelagem completa do armazém com paredes, teto, corredores e prateleiras
- **Interatividade**: Clique nas prateleiras para visualizar os produtos armazenados
- **Navegação Intuitiva**: Controles de câmera para zoom, rotação e pan
- **Informações em Tempo Real**: Tooltips com detalhes dos produtos ao passar o mouse
- **Design Responsivo**: Interface adaptada para diferentes tamanhos de tela

### 🎮 Controles de Navegação

- **Mouse Esquerdo + Arrastar**: Rotacionar a câmera
- **Scroll do Mouse**: Zoom in/out
- **Mouse Direito + Arrastar**: Pan da câmera
- **Clique nas Prateleiras**: Abrir/fechar visualização dos produtos

### 🏗️ Estrutura do Armazém

#### Prateleiras
- **6 prateleiras** distribuídas em 2 níveis
- **Identificação única**: P1-A1, P1-A2, P2-A1, P2-A2, P3-A1, P3-A2
- **Produtos coloridos**: Cada produto tem uma cor única para fácil identificação
- **Quantidade visível**: Informações de estoque em tooltips

#### Corredores
- **4 corredores principais**: A, B, C e D
- **Sinalização clara**: Nomes dos corredores visíveis no piso
- **Linhas de orientação**: Marcações no piso para navegação

#### Produtos
- **Representação visual**: Cubos coloridos representando cada produto
- **Informações detalhadas**: Nome e quantidade ao passar o mouse
- **Efeitos visuais**: Animação de escala ao interagir

## 🛠️ Tecnologias Utilizadas

- **Three.js**: Biblioteca principal para renderização 3D
- **@react-three/fiber**: Integração React com Three.js
- **@react-three/drei**: Componentes auxiliares para Three.js
- **React**: Framework principal da aplicação
- **Material-UI**: Componentes de interface

## 📁 Estrutura do Código

```
src/pages/Armazem3D.jsx
├── Produto              # Componente para produtos individuais
├── Prateleira           # Componente para prateleiras
├── Corredor             # Componente para corredores
├── Armazem3DScene       # Cena principal do armazém
└── Armazem3D            # Componente principal da página
```

## 🚀 Como Usar

1. **Acesse a página**: Navegue para "Armazém 3D" no menu lateral
2. **Explore o armazém**: Use os controles do mouse para navegar
3. **Interaja com prateleiras**: Clique nas prateleiras para ver os produtos
4. **Visualize produtos**: Passe o mouse sobre os produtos para ver detalhes

## 🎨 Personalização

### Adicionando Novas Prateleiras

```javascript
{
  id: 7,
  nome: 'P4-A1',
  position: [0, 1.5, 0],
  size: [3, 0.2, 2],
  nivel: 1,
  produtos: [
    { nome: 'Novo Produto', quantidade: 100, cor: '#ff5722' }
  ]
}
```

### Modificando Cores

```javascript
// Cores dos produtos
const cores = {
  produtoA: '#e74c3c',
  produtoB: '#3498db',
  produtoC: '#2ecc71'
};
```

### Ajustando Iluminação

```javascript
// Configurações de iluminação
<ambientLight intensity={0.4} />
<directionalLight position={[10, 10, 5]} intensity={0.8} />
<pointLight position={[0, 10, 0]} intensity={0.5} />
```

## 🔧 Configurações Avançadas

### Performance
- **LOD (Level of Detail)**: Implementado para otimizar renderização
- **Frustum Culling**: Objetos fora da câmera não são renderizados
- **Shadow Mapping**: Sombras otimizadas para melhor performance

### Responsividade
- **Adaptação automática**: A câmera se ajusta ao tamanho da tela
- **Controles touch**: Suporte para dispositivos móveis
- **Interface adaptativa**: Elementos UI se ajustam ao viewport

## 🐛 Solução de Problemas

### Problemas Comuns

1. **Câmera travada**: Clique com botão direito e arraste para resetar
2. **Performance lenta**: Reduza a qualidade das sombras ou número de objetos
3. **Produtos não aparecem**: Verifique se a prateleira está "aberta" (clicada)

### Debug

```javascript
// Ativar debug helpers
<GridHelper args={[30, 30]} />
<AxesHelper args={[5]} />
```

## 🔮 Próximas Funcionalidades

- [ ] Integração com dados reais da API
- [ ] Busca e filtros 3D
- [ ] Animações de movimentação de produtos
- [ ] Modo VR/AR
- [ ] Exportação de imagens 3D
- [ ] Relatórios visuais 3D

## 📞 Suporte

Para dúvidas ou problemas com a visualização 3D, entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido com ❤️ usando Three.js e React** 