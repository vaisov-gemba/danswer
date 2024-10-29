PERSONA_STARTER_MESSSAGE_CREATION_PROMPT = """
Create a starter message for a chatbot. The response should include three parts:

1. Name: A short, clear title for the prompt (e.g. 'Open Discussion', 'Project Planning')
2. Description: A short explanation of what this prompt is for without full sentences (no more than a line)
3. Message: The actual conversation starter that will be sent to the chatbot. This should be natural and engaging.

Make each part concise but inviting for user interaction.
Context about the assistant - Name: {name}
Description: {description}
"""
