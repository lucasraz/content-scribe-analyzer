
# ContentReview.AI (MVP)

API desenvolvida com FastAPI para análise automática de conteúdo com OpenAI.

## Como usar

1. Instale as dependências:
```
pip install -r requirements.txt
```

2. Execute o servidor localmente:
```
uvicorn main:app --reload
```

3. Acesse a documentação em:
```
http://localhost:8000/docs
```

## Deploy no Railway

- Suba este projeto no seu GitHub
- Conecte ao Railway
- Adicione a variável de ambiente `OPENAI_API_KEY` (ou já use embutida)
