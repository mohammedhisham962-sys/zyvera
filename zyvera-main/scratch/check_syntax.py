with open("src/js/app_react.js", "r", encoding="utf-8") as f:
    text = f.read()

stack = []
in_string = None
escape = False
line_num = 1
col_num = 0
in_block_comment = False
in_line_comment = False

pairs = {')': '(', ']': '[', '}': '{'}
openers = {'(', '[', '{'}

i = 0
n = len(text)
while i < n:
    ch = text[i]
    if ch == '\n':
        line_num += 1
        col_num = 0
        in_line_comment = False
        i += 1
        continue
    col_num += 1

    if in_line_comment:
        i += 1
        continue

    if in_block_comment:
        if ch == '*' and i + 1 < n and text[i+1] == '/':
            in_block_comment = False
            i += 2
            col_num += 1
            continue
        i += 1
        continue

    if in_string:
        if escape:
            escape = False
        elif ch == '\\':
            escape = True
        elif ch == in_string:
            in_string = None
        i += 1
        continue

    # Not in string or comment
    if ch == '/' and i + 1 < n and text[i+1] == '/':
        in_line_comment = True
        i += 2
        col_num += 1
        continue
    if ch == '/' and i + 1 < n and text[i+1] == '*':
        in_block_comment = True
        i += 2
        col_num += 1
        continue

    if ch in ('"', "'", '`'):
        in_string = ch
    elif ch in openers:
        stack.append((ch, line_num, col_num))
    elif ch in pairs:
        if not stack:
            print(f"Error: unexpected closing '{ch}' at line {line_num}:{col_num}")
            break
        top, tl, tc = stack.pop()
        if top != pairs[ch]:
            print(f"Error: mismatched closing '{ch}' at line {line_num}:{col_num} (matches '{top}' from {tl}:{tc})")
            break
    i += 1

if not in_string and not in_block_comment and not stack:
    print("Balance check PERFECT! All brackets, strings, and comments match 100%.")
elif in_string:
    print(f"Warning: unclosed string literal starting with {in_string}")
elif in_block_comment:
    print("Warning: unclosed block comment")
elif stack:
    print(f"Warning: {len(stack)} unclosed brackets on stack, e.g. {stack[-5:]}")
