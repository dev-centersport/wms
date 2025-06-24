# WMS (Warehouse Management System)

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeORM](https://img.shields.io/badge/TypeORM-262627?style=for-the-badge&logo=typeorm&logoColor=white)](https://typeorm.io/)

Sistema de Gerenciamento de Armazém (WMS) desenvolvido com NestJS no backend, React no frontend e PostgreSQL como banco de dados.

## 📋 Pré-requisitos

- Node.js (v16 ou superior)
- Yarn ou npm
- PostgreSQL (ou Docker para rodar via container)
- Git (opcional)

## 🚀 Como executar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/wms-project.git
cd wms-project
```

### 2. Configuração do Backend

```bash
cd wms-backend
yarn install
```

### 3. Configuração do Frontend

```bash
cd ../wms-frontend
yarn install
```

### 4. Inicie o banco de dados (via Docker)

```bash
docker-compose up -d
```

### 5. Execute o backend

```bash
cd ../wms-backend
yarn start:dev
```

### 6. Execute o frontend

```bash
cd ../wms-frontend
yarn start
```

## 🌐 Acesso

- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:3001
- **PostgreSQL**: `localhost:5432` (usuário/senha conforme .env)

## 🛠️ Funcionalidades

### Módulos Principais

- **Gestão de Produtos**
  - Cadastro de produtos (SKU, nome, descrição)
  - Controle de estoque
  - Localização no armazém

- **Gestão de Inventário**
  - Contagem de estoque
  - Ajustes de inventário
  - Relatórios de movimentação

- **Gestão de Ordens**
  - Processamento de pedidos
  - Separação (picking)
  - Expedição

## � Estrutura do Projeto

```
wms-project/
├── wms-backend/           # NestJS backend
│   ├── src/
│   │   ├── modules/       # Módulos do WMS
│   │   ├── shared/        # Utilitários compartilhados
│   │   └── main.ts        # Ponto de entrada
├── wms-frontend/          # React frontend
│   ├── src/
│   │   ├── features/      # Funcionalidades
│   │   ├── components/    # Componentes reutilizáveis
│   │   └── App.tsx        # Componente raiz
└── docker-compose.yml     # Configuração do PostgreSQL
```

## 🤝 Contribuição

Contribuições são bem-vindas! Siga estes passos:

1. Faça um fork do projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

Link do Projeto: [https://github.com/seu-usuario/wms-project](https://github.com/seu-usuario/wms-project)
