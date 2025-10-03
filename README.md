# 📜 Projeto de Avaliação Prática para Tokio Marine

**Sistema de Agendamento Inteligente de Transferências Financeiras**

Este projeto é uma solução Full-Stack desenvolvida como parte da avaliação prática. O objetivo principal é demonstrar a implementação correta de uma **regra de negócio voltada a cálculo de taxa**, arquitetura em camadas e integração entre o Backend Java/Spring Boot e o Frontend React.

---

## 🚀 1. Tecnologias e Versões

O projeto é dividido em dois módulos (**Backend** e **Frontend**) para simular uma arquitetura moderna.

| Módulo | Tecnologia Principal | Versão Chave | Justificativa |
| :--- | :--- | :--- | :--- |
| **Backend** | **Java** | **11** | Atende ao requisito de utilizar o Java 11. Utilizamos o **Spring Boot 2.7.18** (última versão compatível com Java 11). |
| | **Spring Boot** | 2.7.18 | Framework que acelera o desenvolvimento de APIs RESTful. |
| | **Gradle** | (Build Tool) | Utilizado para gerenciamento de dependências. |
| **Frontend** | **React** | (Versão Padrão) | Biblioteca de UI moderna. |
| | **TypeScript** | (Linguagem) | Oferece tipagem estática e maior robustez. |
| | **Vite** | (Build Tool) | Ferramenta de build rápida e leve. |

---

## 📐 2. Decisões Arquiteturais e Estruturais

### 2.1. Arquitetura em Camadas (Backend)

O Backend segue o padrão de **Arquitetura em Camadas** e **POO** (Programação Orientada a Objetos) para garantir a separação de responsabilidades:

* **Controller:** Responsável por requisições HTTP e tratamento de erros. Utiliza o `@ExceptionHandler` para mapear a exceção de negócio para o status **`400 BAD REQUEST`**.
* **Service:** Contém toda a lógica de negócio, incluindo o cálculo da taxa.
* **Repository:** Isola a lógica de acesso a dados (CRUD) usando o Spring Data JPA.
* **Entity/DTO:** Separa o modelo de persistência (`Scheduling`) do contrato de comunicação (`SchedulingRequest`).

### 2.2. Implementação da Regra de Taxa

A tabela de regras de taxa foi isolada e implementada em um **Enum (`TaxRule.java`)**.

* **Vantagem:** Essa decisão garante que a lógica é facilmente **legível** e **manutenível**, concentrando a regra de dias, valor fixo e percentual em um único local, evitando *if/else if* aninhados no Service.
* **Cálculo:** O cálculo utiliza a classe **`BigDecimal`** em todo o pipeline para garantir precisão monetária, evitando erros de ponto flutuante.

### 2.3. Configurações de Integração

* **Persistência:** Foi utilizado o **H2 Database** em modo *in-memory* (em memória), conforme o requisito.
* **CORS:** O acesso do Frontend (porta `5173`) foi habilitado via **`CorsConfig.java`** para permitir a comunicação com o backend (porta `8080`).

---

## 🛠️ 3. Instruções de Execução do Projeto

Certifique-se de ter o **Java 11 JDK** e o **Node.js** instalados antes de iniciar.

### 3.1. Subindo o Backend (`transfer-scheduling-be`)

1.  Navegue até o diretório do backend:
    ```bash
    cd transfer-scheduling-be
    ```
2.  Construa e execute a aplicação usando o Gradle Wrapper:
    ```bash
    ./gradlew bootRun
    ```
    *A API será iniciada em **`http://localhost:8080`**.*

### 3.2. Subindo o Frontend (`transfer-scheduling-fe`)

1.  Em um novo terminal, navegue até o diretório do frontend:
    ```bash
    cd transfer-scheduling-fe
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Inicie o servidor de desenvolvimento do Vite:
    ```bash
    npm run dev
    ```
    *A interface será iniciada em **`http://localhost:5173`**.*

---

## 🌐 4. Endpoints da API e Acesso ao H2

| Endpoint | Método | Descrição |
| :--- | :--- | :--- |
| `/api/schedules` | `POST` | Agenda uma nova transferência, calcula a taxa e salva no DB. |
| `/api/schedules` | `GET` | Retorna o extrato de todos os agendamentos cadastrados. |

### Exemplo de Requisição (POST /api/schedules)

Para testar o endpoint de agendamento, utilize o seguinte JSON no corpo da requisição (Body):

```json
{
    "originAccount": "1234567890",
    "destinationAccount": "0987654321",
    "value": 1000.00,
    "transferDate": "YYYY-MM-DD" 
}
```

### H2 Console (Banco de Dados em Memória)

Para inspecionar o banco de dados H2 enquanto a aplicação estiver rodando:

* **URL:** `http://localhost:8080/h2-console`
* **JDBC URL:** `jdbc:h2:mem:transferdb`
* **User Name:** `sa`
* **Password:** (deixe em branco)
