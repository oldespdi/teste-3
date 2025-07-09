# 🚀 Deploy do Oráculo Digital

## 🌐 Deploy no Render (Recomendado)

### **1. Preparação**

1. **Criar conta no Render:**
   - Acesse: https://render.com
   - Faça login com GitHub

2. **Configurar variáveis de ambiente:**
   - `OPENAI_API_KEY`: Sua chave da OpenAI
   - `JWT_SECRET`: Chave secreta para JWT (será gerada automaticamente)

### **2. Deploy do Backend**

1. **Conectar repositório:**
   - Clique em "New +" → "Web Service"
   - Conecte seu repositório GitHub
   - Selecione o repositório do Oráculo Digital

2. **Configurações:**
   - **Name**: `oraculo-digital-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: `Free`

3. **Variáveis de ambiente:**
   ```
   NODE_ENV=production
   PORT=3001
   OPENAI_API_KEY=sua-chave-openai-aqui
   FRONTEND_URL=https://oraculo-digital-frontend.onrender.com
   ```

4. **Deploy:**
   - Clique em "Create Web Service"
   - Aguarde o build e deploy

### **3. Deploy do Frontend**

1. **Conectar repositório:**
   - Clique em "New +" → "Static Site"
   - Conecte o mesmo repositório

2. **Configurações:**
   - **Name**: `oraculo-digital-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Plan**: `Free`

3. **Variáveis de ambiente:**
   ```
   VITE_API_URL=https://oraculo-digital-backend.onrender.com
   ```

4. **Deploy:**
   - Clique em "Create Static Site"
   - Aguarde o build e deploy

### **4. URLs Finais**

- **Frontend**: `https://oraculo-digital-frontend.onrender.com`
- **Backend**: `https://oraculo-digital-backend.onrender.com`
- **Health Check**: `https://oraculo-digital-backend.onrender.com/api/health`

## 🔧 Alternativas de Deploy

### **Railway**
- Similar ao Render
- Deploy mais simples
- URL: https://railway.app

### **Vercel (Frontend) + Railway (Backend)**
- Vercel para frontend: https://vercel.com
- Railway para backend: https://railway.app

### **Heroku**
- Mais tradicional
- Requer cartão de crédito para verificação
- URL: https://heroku.com

## 📝 Checklist de Deploy

- [ ] Backend configurado e funcionando
- [ ] Frontend configurado e funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado corretamente
- [ ] Health check funcionando
- [ ] Domínio personalizado (opcional)

## 🆘 Troubleshooting

### **Erro de CORS:**
- Verificar se `FRONTEND_URL` está configurado corretamente
- Verificar se o frontend está usando a URL correta do backend

### **Erro de Build:**
- Verificar se todas as dependências estão no `package.json`
- Verificar se os scripts estão configurados corretamente

### **Erro de Variáveis de Ambiente:**
- Verificar se todas as variáveis estão configuradas no Render
- Verificar se a chave da OpenAI está válida

## 🎉 Sucesso!

Após o deploy, seu Oráculo Digital estará online e acessível para usuários do mundo todo! 