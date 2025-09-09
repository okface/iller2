// Responsible for fetching & parsing YAML questions, filtering out image-based ones.
// No external build tools: implement a tiny YAML parser for the constrained structure.

async function fetchQuestions() {
  const res = await fetch('./data/questions.yaml');
  if (!res.ok) throw new Error('Kunde inte ladda questions.yaml');
  const text = await res.text();
  return parseYamlQuestions(text).filter(q => q.uses_image === false);
}

// Minimal YAML parser tailored for the provided file structure (array of maps)
function parseYamlQuestions(src) {
  const lines = src.split(/\r?\n/);
  const items = [];
  let current = null;
  let currentKey = null;
  let multiLineKey = null;
  let multiLineBuffer = [];

  function commitMultiLine() {
    if (multiLineKey && current) {
      current[multiLineKey] = multiLineBuffer.join(' ').trim();
      multiLineKey = null;
      multiLineBuffer = [];
    }
  }

  for (let raw of lines) {
    const line = raw.replace(/\t/g, '    '); // normalize tabs
    if (!line.trim()) { continue; }

    // New item start
    if (/^-\s+number:\s+/.test(line)) {
      commitMultiLine();
      if (current) items.push(current);
      current = {};
      const value = line.split(':').slice(1).join(':').trim();
      current.number = value;
      continue;
    }

    if (!current) continue; // skip until first item

    // Key: value lines
    const keyValMatch = /^\s{2,}([a-zA-Z0-9_]+):\s*(.*)$/.exec(line);
    if (keyValMatch) {
      commitMultiLine();
      const [, key, rest] = keyValMatch;
      if (rest === '') {
        // start of multiline (will aggregate following indented lines that do not define new key)
        multiLineKey = key;
        multiLineBuffer = [];
      } else {
        // attempt to coerce types
        let val = rest.trim();
        if (val === 'false') val = false;
        else if (val === 'true') val = true;
        else if (/^\d+$/.test(val)) val = Number(val);
        current[key] = val;
      }
      currentKey = key;
      continue;
    }

    // options list
    const optionMatch = /^\s{2,}-\s(.*)$/.exec(line);
    if (optionMatch && currentKey === 'options') {
      if (!Array.isArray(current.options)) current.options = [];
      current.options.push(optionMatch[1].trim());
      continue;
    }

    // multi-line continuation (indented, not a new key, not list for other field)
    if (/^\s{4,}\S/.test(line) && multiLineKey) {
      multiLineBuffer.push(line.trim());
      continue;
    }
  }
  commitMultiLine();
  if (current) items.push(current);

  // Normalize & ensure shape
  return items.map(o => ({
    id: o.number,
    category: o.category || 'Okänt',
    question: o.question || '',
    options: o.options || [],
    correct: typeof o.correct_option_index === 'number' ? o.correct_option_index : 0,
    more: o.more_information || '',
    uses_image: !!o.uses_image
  })).filter(x => x.options.length > 0);
}

export { fetchQuestions };
