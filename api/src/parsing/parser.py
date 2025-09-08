from langextract import extract
from .prompts import EXTRACTION_PROMPTS

class LangExtractParser:
    def __init__(self):
        """
        Initializes the LangExtractParser and loads prompts.
        """
        self.prompts = EXTRACTION_PROMPTS

    def parse(self, text: str, entity: str) -> str:
        """
        Selects a prompt for a given entity, formats it with the text,
        and calls the extraction model.

        Args:
            text (str): The input text to parse.
            entity (str): The type of entity to extract (e.g., 'theme', 'sentiment').

        Returns:
            str: The extracted value.
        """
        if entity not in self.prompts:
            raise ValueError(f"Unknown entity type: {entity}")

        prompt_info = self.prompts[entity]
        prompt_template = prompt_info["prompt"]
        examples = prompt_info["examples"]
        
        formatted_prompt = prompt_template.format(text=text)

        # Call the langextract model
        extracted_text = extract(
            text=formatted_prompt,
            examples=examples
        )
        return extracted_text
