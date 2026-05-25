# 🎓 UPA — Upgrade Portal Acadêmico

Sistema acadêmico moderno desenvolvido com **Django REST Framework** e **React**, inspirado em plataformas como Alura, Coursera e portais universitários modernos.

---

## 📖 Sobre o Projeto

O UPA (Upgrade Portal Acadêmico) foi criado para modernizar a experiência acadêmica de alunos, professores e administradores.

O sistema centraliza informações acadêmicas, financeiras e administrativas em uma única plataforma responsiva, intuitiva e acessível.

---

# 🚀 Tecnologias Utilizadas

## Backend

- Python 3
- Django
- Django REST Framework
- SQLite
- JWT Authentication
- CORS Headers

## Frontend

- React
- Vite
- React Router DOM
- Axios
- Lucide React
- CSS Moderno Responsivo

---

# 👥 Perfis do Sistema

## 🎓 Aluno

Funcionalidades:

- Dashboard Acadêmico
- Perfil
- Disciplinas
- Notas
- Calendário Acadêmico
- Arquivos
- Notificações
- Financeiro
- Contato

---

## 👨‍🏫 Professor

Funcionalidades:

- Dashboard
- Minhas Turmas
- Alunos
- Lançamento de Notas
- Materiais Didáticos
- Notificações
- Contato

---

## 👨‍💼 Administrador

Funcionalidades:

- Painel Administrativo
- Gestão Acadêmica
- Gestão Financeira
- Gestão de Usuários
- Calendário Acadêmico
- Notificações

---

# 🎯 Principais Funcionalidades

## Sistema Acadêmico

- Controle de disciplinas
- Histórico acadêmico
- Controle de notas
- Controle de faltas
- Agenda semanal

## Sistema Financeiro

- Mensalidades
- Pendências
- Histórico de pagamentos
- Simulação de boleto
- Simulação de Pix

## Sistema de Comunicação

- Notificações
- Avisos acadêmicos
- Comunicados institucionais

## Sistema de Arquivos

- Materiais didáticos
- Downloads
- Documentos acadêmicos

---

# 📱 Responsividade

O sistema foi desenvolvido para:

- Desktop
- Notebook
- Tablet
- Smartphone

---

# 🔒 Segurança

- JWT Authentication
- Rotas protegidas
- Controle por perfil
- Permissões por usuário

---

# 📂 Estrutura do Projeto

```txt
UPA/
│
├── backend/
│   ├── accounts/
│   ├── academic/
│   ├── financial/
│   ├── notifications/
│   ├── files/
│   └── core/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── README.md
└── .gitignore
```

---

# ⚙️ Instalação

## Backend

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

Servidor:

```txt
http://127.0.0.1:8000
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Servidor:

```txt
http://localhost:5173
```

---

# 🔑 Usuários de Demonstração

## Aluno

```txt
Usuário: rodrigo
Senha: aluno123
```

## Professor

```txt
Usuário: leandro
Senha: prof123
```

## Administrador

```txt
Usuário: admin
Senha: admin123
```

---

# 🏗️ Arquitetura

Frontend:

```txt
React
 ├── Pages
 ├── Components
 ├── Context
 ├── Routes
 └── API Services
```

Backend:

```txt
Django
 ├── Models
 ├── Views
 ├── Serializers
 ├── Permissions
 └── APIs REST
```

---

# 📈 Melhorias Futuras

- Integração com e-mail institucional
- Recuperação de senha por código
- Sistema de estágio
- Sistema de monitoria
- Chat acadêmico
- Aplicativo mobile
- Integração com Google Calendar
- Integração com Microsoft Teams

---

# 👨‍💻 Autor

Rodrigo Araújo Maciel Pinheiro

Projeto acadêmico desenvolvido para modernização de portais universitários utilizando Django REST Framework e React.
