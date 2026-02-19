
import sys

def check_braces(filename):
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    stack = []
    in_string = False
    string_char = ''
    in_comment = False # Multi-line /* ... */
    
    for line_idx, line in enumerate(lines):
        i = 0
        while i < len(line):
            char = line[i]
            
            # Handle comments
            if not in_string and not in_comment:
                if char == '/' and i + 1 < len(line):
                    if line[i+1] == '/': # Single line comment
                        break # Skip rest of line
                    elif line[i+1] == '*': # Multi-line comment start
                        in_comment = True
                        i += 1
                        i += 1; continue
                
            if in_comment:
                if char == '*' and i + 1 < len(line) and line[i+1] == '/':
                    in_comment = False
                    i += 1
                i += 1; continue

            # Handle strings
            if not in_comment:
                if in_string:
                    if char == '\\': # Escape
                        i += 1
                    elif char == string_char:
                        in_string = False
                else:
                    if char == '"' or char == "'" or char == '`':
                        in_string = True
                        string_char = char
                    
                    # Handle braces
                    elif char == '{':
                        stack.append( (line_idx + 1, line.strip()) )
                    elif char == '}':
                        if not stack:
                            print(f"Unexpected }} at line {line_idx + 1}: {line.strip()}")
                            return
                        stack.pop()
            
            i += 1

    if stack:
        print("Unclosed braces found:")
        for (ln, txt) in stack:
             print(f"Line {ln}: {txt}")
    else:
        print("Braces are balanced.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python check_braces.py <filename>")
    else:
        check_braces(sys.argv[1])
