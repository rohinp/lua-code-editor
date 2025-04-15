import json

input_file = "/Users/rohinpatel/Development/myprojects/lua-code-editor/fine-tune/lua_data.jsonl"
reverse_file = "/Users/rohinpatel/Development/myprojects/lua-code-editor/fine-tune/lua_data_reverse.jsonl"

new_lines = []
reverse_lines = []

with open(input_file, "r") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        data = json.loads(line)
        # Replace literal "\\n" with actual newlines in all string fields
        for k, v in data.items():
            if isinstance(v, str):
                data[k] = v.replace("\\n", "\n")
        new_lines.append(json.dumps(data, ensure_ascii=False))

        # If there is an "input" and "output" field, create reversed entry
        if "input" in data and "output" in data:
            reversed_dict = {
                "input": data["output"],
                "output": data["input"]
            }
            reverse_lines.append(json.dumps(reversed_dict, ensure_ascii=False))

# Overwrite the original file with updated lines
with open(input_file, "w") as f:
    f.write("\n".join(new_lines) + "\n")

# Create a new file with at least 200 reversed pairs
with open(reverse_file, "w") as f:
    for i, line in enumerate(reverse_lines):
        if i >= 200:
            break
        f.write(line + "\n")
