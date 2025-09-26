# API Rozemyne

Este projeto é uma API de registro de Hobbies. Servindo para registrar o andamento de visualização de filmes, séries, livros, HQ's, e mangas.

Esta API conta com uma parte administrativa e uma parte para usuários comuns. Com opções de cadastro, login, dados de conta, autenticação em 2 fatores, listagem de mídias e gerenciamento do que já foi visto e seu acompanhamento

### Como executar a aplicação? (Docker)

1. Acesse o root do projeto pelo terminal (O que possui a parte /src)
2. Rodando localmente:
  a. Rode `npm run build`
  b. Rode `npm run start:prod`
2. Executando pelo Docker:
  a. Rode: `npm run compose:up`
3. Acesse a documentação da API na URL `http://localhost:4000/docs`
4. Fluxo sugerido:
  a. Login como admin (credenciais nas variáveis de ambiente)
  b. Cadastro de alguns livros / series / filmes / etc
  c. Criação de listas de visualização
  d. Criação de registros de leitura (saves)
  e. logout

Link do repositório no Docker Hub:
