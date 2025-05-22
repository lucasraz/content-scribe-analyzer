
from fastapi import FastAPI
from pydantic import BaseModel
import openai

openai.api_key = "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"

app = FastAPI()

class Content(BaseModel):
    text: str

@app.post("/analyze")
async def analyze(content: Content):
    try:
        moderation = openai.Moderation.create(input=content.text)
        flagged = moderation["results"][0]["flagged"]
        categories = moderation["results"][0]["categories"]

        completion = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Você é um analista de conteúdo UGC."},
                {"role": "user", "content": f"Avalie esse conteúdo quanto à qualidade e engajamento: {content.text}"}
            ]
        )
        insights = completion.choices[0].message.content

        return {
            "flagged": flagged,
            "categories": categories,
            "insights": insights
        }

    except Exception as e:
        return {"error": str(e)}
