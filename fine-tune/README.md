# 🧠 Lua-GPT2 Explainer (ONNX)

A lightweight GPT-2 model fine-tuned specifically for **explaining Lua code**, optimized for **in-browser inference** using ONNX and Transformers.js.

---

## 🚀 What is this?

This model takes **Lua code snippets as input** and returns **natural language explanations** describing what the code does — ideal for:

- Learning Lua syntax
- Understanding game logic
- Building smart Lua IDEs

The model was fine-tuned on a custom dataset of Lua functions paired with short, clear English explanations.

---

## 🤔 Why this project?

Lua is a powerful, lightweight scripting language used in:

- Game engines (e.g., Roblox, WoW Addons)
- Embedded systems
- Configuration scripting

But there’s a gap in AI tooling for **code explanation**, especially for Lua. Most LLMs are too large or not trained on enough Lua.

So the goal was:
1. Create a **small, specialized model**
2. Fine-tune it to **explain Lua code accurately**
3. Export it to **ONNX format** for use **in-browser** without server-side compute

---

## 🔨 How it was built

### 1. **Data Collection**
- Created a custom dataset of `lua_code` → `explanation` pairs
- Extracted logic from GitHub + manually written examples
- Formatted into `JSONL` for easy training

### 2. **Model Fine-Tuning**
- Used Hugging Face's `GPT-2` (`gpt2`)
- Fine-tuned on `lua_data.jsonl` using `Trainer`
- Focused only on **code ➝ explanation** (unidirectional) for now

### 3. **Export to ONNX**
- Used `optimum-cli` to convert the fine-tuned PyTorch model:
  ```bash
  optimum-cli export onnx --model ./lua_gpt2_final ./lua_gpt2_onnx \
    --task text-generation --opset 14 --library transformers
