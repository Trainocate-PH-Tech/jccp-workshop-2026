# Example 5: Tool-Assisted Impact Scoring

## High Level Flow

```
Manual Trigger
   ↓
Set (incident_note_01.txt)
   ↓
AI Agent (OpenAI + tool)
   ↓
Parse JSON
   ↓
Generate HTML
```

## Goal

Use a single incident note file as input. The AI calls a tool to extract key values and compute a simple impact score, then returns a structured summary.

## Input File (single file)

Use this file as the only input:

- `sample_inputs/incident_note_01.txt`

### Input File Contents (`sample_inputs/incident_note_01.txt`)

```
A sudden pressure spike was observed in the hydroprocessing unit.
The pressure transmitter PT-204 showed erratic readings before the unit tripped.
Operators switched to manual control but response was delayed.
No injuries occurred, but production was halted for approximately 6 hours.
```

## 1) Create a Set Node (single file input)

Create a **Set** node with:

- Field name: `incident_text`
- Data type: `String`
- Value: contents of `sample_inputs/incident_note_01.txt`

## 2) Add an AI Agent (OpenAI)

Add an **AI Agent** node and select an OpenAI model (e.g., `gpt-4o-mini`).

### System Message

```
You are an AI assistant for operational training.
You must call the tool to extract and compute impact values.
Return only valid JSON.
```

### User Message

```
You are given a single incident note.
Use the tool compute_impact_metrics to get downtime hours, equipment tags, and an impact score.

Return ONLY valid JSON with this structure:

{
  "incident_summary": string,
  "equipment_tags": [string],
  "downtime_hours": number | null,
  "impact_score": number,
  "operational_impact": string,
  "recommended_action": string
}

Incident note:
{{ $json.incident_text }}
```

## 3) Add a Tool (Code Tool)

Add a **Code** tool to the AI Agent and name it `compute_impact_metrics`.

### Tool Parameter

The AI Agent tool passes input as `query` automatically. You do not need to define a schema.

### Tool Code (JavaScript)

```javascript
const text = $json.query || "";

const hoursMatch = text.match(/(\d+)\s*hours?/i);
const downtimeHours = hoursMatch ? Number(hoursMatch[1]) : null;

// Basic equipment tag extraction like PT-204, FV-12, etc.
const tagMatches = text.match(/[A-Z]{2,4}-\d{2,4}/g) || [];
const equipmentTags = Array.from(new Set(tagMatches));

// Simple impact score: downtime hours + 2x number of equipment tags
const impactScore = (downtimeHours || 0) + equipmentTags.length * 2;

// AI Agent tools must return a single string
return JSON.stringify({
  downtime_hours: downtimeHours,
  equipment_tags: equipmentTags,
  impact_score: impactScore,
});
```

## 4) Parse the AI Output (Set Node)

Add a **Set** node and create a field:

- Field name: `parsed`
- Data type: `Object`
- Value (expression):

```
{{ JSON.parse($json.output[0].content[0].text) }}
```

## 5) Generate HTML

Add an **HTML** node (Generate HTML Template) with the following:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Incident Impact Summary</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      line-height: 1.5;
      color: #1f2a44;
    }
    h1 {
      color: #2c3e50;
    }
    .label {
      font-weight: bold;
      margin-top: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 14px;
    }
    th, td {
      text-align: left;
      padding: 10px;
      border: 1px solid #e3e7ee;
    }
    th {
      background: #f7f9fb;
    }
  </style>
</head>
<body>

<h1>Incident Impact Summary</h1>

<div class="label">Incident Summary</div>
<div>{{ $json.parsed.incident_summary }}</div>

<div class="label">Operational Impact</div>
<div>{{ $json.parsed.operational_impact }}</div>

<div class="label">Recommended Action</div>
<div>{{ $json.parsed.recommended_action }}</div>

<table>
  <thead>
    <tr>
      <th>Downtime Hours</th>
      <th>Impact Score</th>
      <th>Equipment Tags</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>{{ $json.parsed.downtime_hours }}</td>
      <td>{{ $json.parsed.impact_score }}</td>
      <td>{{ $json.parsed.equipment_tags.join(', ') }}</td>
    </tr>
  </tbody>
</table>

</body>
</html>
```
