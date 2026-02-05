# Example 2: Incident Understanding with Structure

## Setup the AI Model (OpenAI)

### System Message

```
You are an AI system that outputs strictly valid JSON.
Do not include explanations, markdown, or extra text.
```

### User Message

* We are now constraining the AI
* Freedom is the enemy of automation

```
Analyze the following engineering incident.

Return ONLY valid JSON with the following structure:

{
  "technical_summary": string,
  "instrumentation_observations": string,
  "it_system_implications": string,
  "training_lessons_learned": string,
  "severity": "low" | "medium" | "high",
  "recommended_next_steps": [string]
}

Incident:
{{ $json.incident_text }}
```

## Input File Contents (`sample_inputs/incident_note_01.txt`)

Use this as the value for `incident_text` in your Set node or as the incoming payload.

```
A sudden pressure spike was observed in the hydroprocessing unit.
The pressure transmitter PT-204 showed erratic readings before the unit tripped.
Operators switched to manual control but response was delayed.
No injuries occurred, but production was halted for approximately 6 hours.
```

## Setup a Parser

1. Add a **Set** Node
2. Add a field with name `parsed` and data type `Object` and value as an expression:

```
{{ JSON.parse($json.output[0].content[0].text) }}
```

## Add an HTML Node (Generate HTML Template) with the following contents:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Structured Incident Report</title>
</head>
<body>

<h1>Engineering Incident Report</h1>

<h2>Technical Summary</h2>
<p>{{ $json.parsed.technical_summary }}</p>

<h2>Instrumentation Observations</h2>
<p>{{ $json.parsed.instrumentation_observations }}</p>

<h2>IT System Implications</h2>
<p>{{ $json.parsed.it_system_implications }}</p>

<h2>Training Lessons Learned</h2>
<p>{{ $json.parsed.training_lessons_learned }}</p>

<h2>Severity</h2>
<p><strong>{{ $json.parsed.severity }}</strong></p>

<h2>Recommended Next Steps</h2>
<ul>
  {{ $json.parsed.recommended_next_steps.map(step => `<li>${step}</li>`).join('') }}
</ul>

</body>
</html>
```
