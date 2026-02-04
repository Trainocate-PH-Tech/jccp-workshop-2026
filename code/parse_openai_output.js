const raw = $json.output[0].content[0].text;
const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
const parsed = JSON.parse(cleaned);
return [{ json: parsed }];
