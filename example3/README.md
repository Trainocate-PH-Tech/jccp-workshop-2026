# Example 3: Data-Driven Incident Review for Engineering Managers

## High Level Flow

```
Webhook / Manual Trigger
   ↓
Load Data Files (sensor + logs)
   ↓
OpenAI (data-aware analysis)
   ↓
Structured JSON (manager view)
   ↓
HTML / Markdown report
   ↓
Respond to Webhook
```

## Context

```
An engineering manager receives sensor data and alarm logs after a unit trip. They don't have time to inspect raw CSVs line per line
```

## Data Files Needed:

* `sensor_timeseries.csv`
* `sensor_alarm_log.csv`
* `control_mode_events.csv`
* `sensor_metadata.json`

## Input File Contents

### `sensor_timeseries.csv`

```
timestamp,sensor_id,value,unit
2026-02-02T14:28:00,PT-204,4.1,bar
2026-02-02T14:29:00,PT-204,5.3,bar
2026-02-02T14:30:00,PT-204,6.8,bar
```

### `sensor_alarm_log.csv`

```
timestamp,alarm_id,sensor_id,description,severity
2026-02-02T14:30:15,ALM-PT-204,PT-204,Pressure High Warning,Medium
2026-02-02T14:31:05,ALM-PT-204,PT-204,Pressure High High,Critical
```

### `control_mode_events.csv`

```
timestamp,event_type,details
2026-02-02T14:32:10,MODE_CHANGE,AUTO -> MANUAL
2026-02-02T14:35:20,UNIT_TRIP,Emergency shutdown triggered
```

### `sensor_metadata.json`

```json
{
  "PT-204": {
    "type": "Pressure Transmitter",
    "location": "Hydroprocessing Unit A",
    "range": "0-10 bar",
    "criticality": "High"
  }
}
```

## Create Edit Fields for the Data Files

For each of the data files, create a **Set Node** and configure it for the following:

1. Give it a field name (i.e. `sensor_timeseries`)
2. Data Type is `String`
3. Value is the content of the file

## Create the OpenAI Node

### System Prompt

```
You are an AI assistant supporting engineering management decisions.
You analyze operational data and highlight management-relevant insights.
Return only structured JSON.
```

### User Prompt

```
You are given operational data related to a unit trip.

Analyze the following inputs and return ONLY valid JSON with this structure:

{
  "incident_overview": string,
  "key_operational_findings": [string],
  "instrumentation_concerns": [string],
  "control_system_behavior": string,
  "management_risks": [string],
  "recommended_manager_actions": [string],
  "confidence_level": "low" | "medium" | "high"
}

Alarm log:
{{ $json.sensor_alarm_log }}

Sensor timeseries:
{{ $json.sensor_timeseries }}
```

## Add a Parse Edit Node (Set)

1. Set field name to `parsed`
2. Set data type to `Object`

## Add a `Generate HTML` Node

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Engineering Manager Incident Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      line-height: 1.5;
    }
    h1 {
      color: #2c3e50;
    }
    h2 {
      margin-top: 30px;
      color: #34495e;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }
    ul {
      margin-left: 20px;
    }
    .severity {
      font-weight: bold;
      text-transform: uppercase;
    }
    .severity.low { color: green; }
    .severity.medium { color: orange; }
    .severity.high { color: red; }

    .footer {
      margin-top: 40px;
      font-size: 0.85em;
      color: #666;
      border-top: 1px solid #ddd;
      padding-top: 10px;
    }
  </style>
</head>
<body>

<h1>Engineering Manager Incident Report</h1>

<h2>Incident Overview</h2>
<p>{{ $json.parsed.incident_overview }}</p>

<h2>Key Operational Findings</h2>
<ul>
  {{ $json.parsed.key_operational_findings.map(f => `<li>${f}</li>`).join('') }}
</ul>

<h2>Instrumentation Concerns</h2>
<ul>
  {{ $json.parsed.instrumentation_concerns.map(i => `<li>${i}</li>`).join('') }}
</ul>

<h2>Control System Behavior</h2>
<p>{{ $json.parsed.control_system_behavior }}</p>

<h2>Management Risks</h2>
<ul>
  {{ $json.parsed.management_risks.map(r => `<li>${r}</li>`).join('') }}
</ul>

<h2>Recommended Manager Actions</h2>
<ul>
  {{ $json.parsed.recommended_manager_actions.map(a => `<li>${a}</li>`).join('') }}
</ul>

<h2>Confidence Level</h2>
<p class="severity {{ $json.parsed.confidence_level }}">
  {{ $json.parsed.confidence_level }}
</p>

<div class="footer">
  This report is AI-generated for decision support only.<br/>
  Final judgment and actions remain the responsibility of engineering management.
</div>

</body>
</html>
```
