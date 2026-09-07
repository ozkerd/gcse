import re
import json
import os

GCSE_DATA_PATH = 'src/lib/curriculum/gcse-data.ts'

with open(GCSE_DATA_PATH, 'r', encoding='utf-8') as f:
    text = f.read()

# Match seedChunk_1 to seedChunk_11
chunk_pattern = re.compile(r'const (seedChunk_\d+): SeedQuestion\[\] = (\[.*?\]);', re.DOTALL)
matches = chunk_pattern.findall(text)

print(f"Found {len(matches)} seed chunks.")

all_questions = []
chunk_map = {}

for name, body in matches:
    data = json.loads(body)
    chunk_map[name] = data
    all_questions.extend(data)

print(f"Total questions loaded: {len(all_questions)}")

# Group questions by topicId
by_topic = {}
for q in all_questions:
    t_id = q.get('topicId', 'unknown')
    if t_id not in by_topic:
        by_topic[t_id] = []
    by_topic[t_id].append(q)

print(f"Total unique topics: {len(by_topic)}")

def clean_latex(val):
    if not val:
        return ""
    # Strip wrapping $...$ and \text{...}
    s = val.strip()
    if s.startswith('$') and s.endswith('$'):
        s = s[1:-1].strip()
    s = re.sub(r'\\text\{([^}]+)\}', r'\1', s)
    return s.strip()

def extract_number(val):
    c = clean_latex(val)
    # Search for float/int
    m = re.search(r'[-+]?\d*\.?\d+', c)
    if m:
        return m.group(0)
    return c

# Transform questions topic by topic
updated_questions = []

for t_id, q_list in by_topic.items():
    subject_id = t_id.split('-')[0] # m, p, ch, bio, cs, hist, eng, geo, bus, econ
    
    for idx, q in enumerate(q_list):
        new_q = dict(q)
        
        # 0..9 (20%) -> multiple_choice
        if idx < 10:
            new_q['questionType'] = 'multiple_choice'
            new_q['markScheme'] = f"1 mark for selecting the correct option ({clean_latex(new_q['correctAnswer'])})."
            # ensure options exist
            if not new_q.get('options') or len(new_q.get('options')) < 4:
                correct = new_q['correctAnswer']
                new_q['options'] = [correct, f"Incorrect option A for {q.get('id')}", f"Incorrect option B", f"Incorrect option C"]
        else:
            # 10..49 (80%) -> numerical, fill_in_blank, or short_answer
            # Remove options for written types
            if 'options' in new_q:
                del new_q['options']
                
            is_stem = subject_id in ['m', 'p', 'ch', 'bio', 'cs', 'econ']
            
            # Decide type based on index within 10..49
            sub_idx = idx - 10 # 0..39
            
            if is_stem:
                if sub_idx < 20:
                    # Numerical calculation
                    new_q['questionType'] = 'numerical'
                    num_val = extract_number(new_q['correctAnswer'])
                    raw_ans = clean_latex(new_q['correctAnswer'])
                    
                    acceptable = list(set([
                        raw_ans,
                        num_val,
                        raw_ans.lower(),
                        num_val.lower(),
                        f"{num_val}.0" if '.' not in num_val else num_val.rstrip('0').rstrip('.')
                    ]))
                    new_q['acceptableAnswers'] = [a for a in acceptable if a]
                    new_q['numericalTolerance'] = 0.05
                    new_q['markScheme'] = f"1 mark for correct method/formula application.\n1 mark for correct numerical evaluation: {num_val} (tolerance ±0.05)."
                elif sub_idx < 30:
                    # Fill in blank
                    new_q['questionType'] = 'fill_in_blank'
                    ans_clean = clean_latex(new_q['correctAnswer'])
                    new_q['fillInTemplate'] = f"Complete the statement: {new_q['questionText']} → _____"
                    acceptable = list(set([
                        ans_clean,
                        ans_clean.lower(),
                        ans_clean.title(),
                        re.sub(r'[^\w\s]', '', ans_clean)
                    ]))
                    new_q['acceptableAnswers'] = [a for a in acceptable if a]
                    new_q['markScheme'] = f"1 mark for providing the correct term/value: '{ans_clean}'."
                else:
                    # Short answer
                    new_q['questionType'] = 'short_answer'
                    ans_clean = clean_latex(new_q['correctAnswer'])
                    overview = new_q.get('explanation', {}).get('overview', '')
                    steps = new_q.get('explanation', {}).get('stepByStep', [])
                    
                    acceptable = [ans_clean, ans_clean.lower()]
                    if overview:
                        acceptable.append(overview)
                    new_q['acceptableAnswers'] = list(set(acceptable))
                    
                    step_text = f"\n• 1 mark: {steps[0]}" if steps else ""
                    new_q['markScheme'] = f"• 1 mark: Identify core concept ({overview or ans_clean}).{step_text}\n• 1 mark: Clear technical accuracy."
            else:
                # Humanities / Languages
                if sub_idx < 25:
                    # Short answer
                    new_q['questionType'] = 'short_answer'
                    ans_clean = clean_latex(new_q['correctAnswer'])
                    overview = new_q.get('explanation', {}).get('overview', '')
                    steps = new_q.get('explanation', {}).get('stepByStep', [])
                    
                    acceptable = [ans_clean, ans_clean.lower()]
                    if overview:
                        acceptable.append(overview)
                    new_q['acceptableAnswers'] = list(set(acceptable))
                    
                    step_text = f"\n• 1 mark: {steps[0]}" if steps else ""
                    new_q['markScheme'] = f"• 1 mark: Correct identification of key term/event ({ans_clean}).{step_text}\n• 1 mark: Explanation linking to context."
                else:
                    # Fill in blank
                    new_q['questionType'] = 'fill_in_blank'
                    ans_clean = clean_latex(new_q['correctAnswer'])
                    new_q['fillInTemplate'] = f"Identify the missing term: {new_q['questionText']} → _____"
                    acceptable = list(set([
                        ans_clean,
                        ans_clean.lower(),
                        ans_clean.title(),
                        re.sub(r'[^\w\s]', '', ans_clean)
                    ]))
                    new_q['acceptableAnswers'] = [a for a in acceptable if a]
                    new_q['markScheme'] = f"1 mark for the correct specific term: '{ans_clean}'."

        updated_questions.append(new_q)

print(f"Total updated questions: {len(updated_questions)}")

# Re-chunk into 11 seedChunks (500 items each, 150 for 11th)
chunk_size = 500
new_chunks = {}
chunk_names = [f"seedChunk_{i}" for i in range(1, 12)]

for idx, name in enumerate(chunk_names):
    start = idx * chunk_size
    end = start + chunk_size if idx < 10 else len(updated_questions)
    new_chunks[name] = updated_questions[start:end]
    print(f"New {name} has {len(new_chunks[name])} items.")

# Replace chunk blocks in text safely without regex escape issues
new_text = text
for name in chunk_names:
    json_str = json.dumps(new_chunks[name], indent=2)
    start_tag = f"const {name}: SeedQuestion[] = ["
    start_pos = new_text.find(start_tag)
    if start_pos != -1:
        end_pos = new_text.find("];", start_pos) + 2
        new_text = new_text[:start_pos] + f"const {name}: SeedQuestion[] = {json_str};" + new_text[end_pos:]

with open(GCSE_DATA_PATH, 'w', encoding='utf-8') as f:
    f.write(new_text)

print("Successfully updated src/lib/curriculum/gcse-data.ts with 20/80 multi-type database!")
