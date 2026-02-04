# Example 1: Incident Understanding

```
This incident note could have been written by any operator or engineer.
Today, everyone reads it and rewrites it differently.
We’re going to standardize understanding, not judgment.
```

## 1 - Create a New Workflow

A workflow is just a repeatable process. Nothing runs unless we trigger it.

1. Click on New Workflow (+)
2. Add a manual trigger

## 2 - Add the AI Step (Understanding Only)

1. Click (+) then select OpenAI
2. Choose **Message a Model**
3. Select a model (`gpt-4o-mini`)

### System Message

```
You are an AI assistant supporting downstream energy operations and training.
```

### User Message (`sample_inputs/incident_note_01.txt`)

```
A sudden pressure spike was observed in the hydroprocessing unit.
The pressure transmitter PT-204 showed erratic readings before the unit tripped.
Operators switched to manual control but response was delayed.
No injuries occurred, but production was halted for approximately 6 hours.
```

### Parse to HTML
