-- ============================================================
-- APS FINANCEIRO - MYSQL 8.x
-- Estrutura de tabelas para o banco existente: projeto_financeiro
-- Compatível com DBeaver
-- ============================================================

USE projeto_financeiro;

-- ============================================================
-- TABELA: usuario
-- ============================================================
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_usuario PRIMARY KEY (id_usuario),
    CONSTRAINT uq_usuario_email UNIQUE (email)
) ENGINE=InnoDB;

-- ============================================================
-- TABELA: categoria
-- ============================================================
CREATE TABLE IF NOT EXISTS categoria (
    id_categoria BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_usuario BIGINT UNSIGNED NOT NULL,
    nome VARCHAR(100) NOT NULL,
    tipo ENUM('RECEITA', 'DESPESA') NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_categoria PRIMARY KEY (id_categoria),

    CONSTRAINT fk_categoria_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT uq_categoria_usuario_nome_tipo
        UNIQUE (id_usuario, nome, tipo)
) ENGINE=InnoDB;

CREATE INDEX idx_categoria_usuario
    ON categoria(id_usuario);

-- ============================================================
-- TABELA: movimentacao
-- ============================================================
CREATE TABLE IF NOT EXISTS movimentacao (
    id_movimentacao BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_usuario BIGINT UNSIGNED NOT NULL,
    id_categoria BIGINT UNSIGNED NOT NULL,
    descricao VARCHAR(150) NOT NULL,
    tipo ENUM('RECEITA', 'DESPESA') NOT NULL,
    natureza ENUM('FIXA', 'VARIAVEL') NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    data_movimentacao DATE NOT NULL,
    observacao VARCHAR(500) NULL,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_movimentacao PRIMARY KEY (id_movimentacao),

    CONSTRAINT chk_movimentacao_valor
        CHECK (valor > 0),

    CONSTRAINT fk_movimentacao_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_movimentacao_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categoria(id_categoria)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_movimentacao_usuario
    ON movimentacao(id_usuario);

CREATE INDEX idx_movimentacao_categoria
    ON movimentacao(id_categoria);

CREATE INDEX idx_movimentacao_data
    ON movimentacao(data_movimentacao);

CREATE INDEX idx_movimentacao_usuario_data
    ON movimentacao(id_usuario, data_movimentacao);

-- ============================================================
-- TABELA: orcamento
-- ============================================================
CREATE TABLE IF NOT EXISTS orcamento (
    id_orcamento BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_usuario BIGINT UNSIGNED NOT NULL,
    id_categoria BIGINT UNSIGNED NOT NULL,
    mes TINYINT UNSIGNED NOT NULL,
    ano SMALLINT UNSIGNED NOT NULL,
    valor_limite DECIMAL(12,2) NOT NULL,
    percentual_alerta DECIMAL(5,2) NOT NULL DEFAULT 80.00,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_orcamento PRIMARY KEY (id_orcamento),

    CONSTRAINT chk_orcamento_mes
        CHECK (mes BETWEEN 1 AND 12),

    CONSTRAINT chk_orcamento_ano
        CHECK (ano >= 2000),

    CONSTRAINT chk_orcamento_valor
        CHECK (valor_limite > 0),

    CONSTRAINT chk_orcamento_percentual
        CHECK (percentual_alerta > 0 AND percentual_alerta <= 100),

    CONSTRAINT fk_orcamento_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_orcamento_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categoria(id_categoria)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_orcamento_periodo
        UNIQUE (id_usuario, id_categoria, mes, ano)
) ENGINE=InnoDB;

CREATE INDEX idx_orcamento_usuario
    ON orcamento(id_usuario);

CREATE INDEX idx_orcamento_categoria
    ON orcamento(id_categoria);

CREATE INDEX idx_orcamento_periodo
    ON orcamento(ano, mes);

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
SHOW TABLES;

DESCRIBE usuario;
DESCRIBE categoria;
DESCRIBE movimentacao;
DESCRIBE orcamento;