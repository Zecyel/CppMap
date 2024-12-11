from flask import Blueprint, request, jsonify
import openai
import os
import json
from openai import OpenAI

ai = Blueprint('ai', __name__)

client = OpenAI(
    base_url="https://xiaoai.plus/v1",
    api_key="sk-ws1nM76WbDuNZCNSF6C2B3Aa0aF3426aBa477c45D3Cd1e61"
)

@ai.route('/', methods=['GET'])
def ai_home():
    return jsonify({'message': 'Welcome to the AI blueprint'})

ret = {}
UseCache = True

@ai.route('/attractions', methods=['GET'])
def get_attractions():
    place_name = request.args.get('place')
    if not place_name:
        return jsonify({'error': '未提供地点名称'}), 400

    # 创建提示
    prompt = ("""
请列出 %s 的景点，包括景点名称、游玩所需时长和景点简介，以JSON格式返回。其中duration的单位是小时。参考格式如下：
```json
[
    \{
        "name": "景点1",
        "duration": 1,
        "description": "景点的简介1"
    },\{
        "name": "景点2",
        "duration": 0.5,
        "description": "景点的简介1"
    },
]
```
请给出尽可能多的数据
""" % place_name).strip()

    global ret
    if ret != {} and UseCache: return ret
    # 调用 OpenAI 的 API
    response = client.chat.completions.create(
        model='gpt-4o',
        messages=[
            { "role": "system", "content": "You are a helpful assistant." },
            { "role": "user", "content": prompt }
        ]
    )

    # 处理响应
    attractions_text = response.choices[0].message.content.strip()
    print(attractions_text)
    
    # parse the ```json``` code block
    l = attractions_text.find('```json')
    r = attractions_text.find('```', l+1)
    attractions_text = attractions_text[l+7:r].strip()
    print(attractions_text)

    # 将文本解析为 JSON
    try:
        attractions = json.loads(attractions_text)
    except json.JSONDecodeError:
        attractions = {'attractions': attractions_text}

    ret = jsonify(attractions)
    return ret