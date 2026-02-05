# Example 4: Tool-Assisted Downtime Extraction

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

Use a single incident note file as input and let the AI call a tool to extract the downtime hours, then produce a clean report.

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

For reference:

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
You must call the tool to extract downtime hours.
Return only valid JSON.
```

### User Message

```
You are given a single incident note.
Use the tool extract_downtime_hours to get the downtime hours.

Return ONLY valid JSON with this structure:

{
  "incident_summary": string,
  "downtime_hours": number | null,
  "operational_impact": string,
  "recommended_action": string
}

Incident note:
{{ $json.incident_text }}
```

## 3) Add a Tool (Code Tool)

Add a **Code** tool to the AI Agent and name it `extract_downtime_hours`.

### Tool Code (JavaScript)

```javascript
const text = $json.incident_text || "";
const match = text.match(/(\d+)\s*hours?/i);

return [
  {
    json: {
      downtime_hours: match ? Number(match[1]) : null,
    },
  },
];
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
  <title>Incident Downtime Report</title>
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
    .value {
      margin-top: 6px;
    }
  </style>
</head>
<body>

<h1>Incident Downtime Report</h1>

<div class="label">Incident Summary</div>
<div class="value">{{ $json.parsed.incident_summary }}</div>

<div class="label">Downtime Hours (tool-extracted)</div>
<div class="value">{{ $json.parsed.downtime_hours }}</div>

<div class="label">Operational Impact</div>
<div class="value">{{ $json.parsed.operational_impact }}</div>

<div class="label">Recommended Action</div>
<div class="value">{{ $json.parsed.recommended_action }}</div>

</body>
</html>
```
