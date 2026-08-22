# 1. Escolhe um Linux super leve que já vem com Node.js instalado
FROM node:20-alpine

# 2. Cria uma pasta chamada /app dentro do container
WORKDIR /app

# 3. Copia os arquivos de dependências primeiro (isso deixa o Docker mais rápido)
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# 4. Instala as bibliotecas do Node.js
RUN npm install

# 5. Gera o cliente do Prisma para o Linux (MUITO IMPORTANTE)
# O Prisma cria arquivos diferentes dependendo do sistema (Windows vs Linux).
# Como o container é Linux, temos que gerar os arquivos do Prisma lá dentro.
RUN npx prisma generate

# 6. Copia o resto de todo o seu código para dentro do container
COPY . .

# 7. Expõe a porta que a API vai usar
EXPOSE 3333

# 8. Comando para iniciar sua API
# Se você usa "tsx watch src/server.ts" no seu package.json (npm run dev), ele vai usar isso:
CMD ["npm", "run", "dev"]